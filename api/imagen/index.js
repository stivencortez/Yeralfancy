/**
 * POST /api/imagen — sube una imagen al canal de Telegram y devuelve
 * la URL del proxy (/api/imagen/<file_id>) para guardar en la base.
 *
 * Variables de entorno (panel de Vercel):
 *   TELEGRAM_BOT_TOKEN — token del bot (@BotFather)
 *   TELEGRAM_CHAT_ID   — id del canal privado (-100...) donde se archivan
 */
const MAX_BYTES = 4 * 1024 * 1024 // límite de payload de Vercel (~4.5 MB)

async function leerCuerpo(req) {
  if (req.body) {
    if (Buffer.isBuffer(req.body)) return req.body
    if (typeof req.body === 'string') return Buffer.from(req.body, 'binary')
  }
  const trozos = []
  for await (const t of req) trozos.push(t)
  return Buffer.concat(trozos)
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Tipo, X-Nombre')
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return res.status(501).json({ error: 'Telegram no configurado' })

  try {
    const buffer = await leerCuerpo(req)
    if (!buffer.length) return res.status(400).json({ error: 'Cuerpo vacío' })
    if (buffer.length > MAX_BYTES) return res.status(413).json({ error: 'Imagen demasiado grande' })

    const tipo = req.headers['x-tipo'] || 'image/jpeg'
    const nombre = String(req.headers['x-nombre'] || `imagen_${Date.now()}.jpg`).replace(/[^\w.\-]/g, '_').slice(0, 80)

    // sendDocument conserva los bytes originales (sin recompresión de Telegram)
    const form = new FormData()
    form.append('chat_id', chatId)
    form.append('disable_notification', 'true')
    form.append('document', new Blob([buffer], { type: tipo }), nombre)

    const r = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, { method: 'POST', body: form })
    const json = await r.json()
    if (!json.ok) return res.status(502).json({ error: 'Telegram: ' + (json.description || 'error desconocido') })

    const doc = json.result.document || (Array.isArray(json.result.photo) ? json.result.photo[json.result.photo.length - 1] : null)
    if (!doc?.file_id) return res.status(502).json({ error: 'Telegram no devolvió file_id' })

    return res.status(200).json({ url: `/api/imagen/${doc.file_id}` })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
