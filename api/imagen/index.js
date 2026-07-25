/**
 * POST /api/imagen — sube una imagen al canal de Telegram y devuelve
 * la URL del proxy (/api/imagen/<file_id>) para guardar en la base.
 *
 * Variables de entorno (panel de Vercel):
 *   TELEGRAM_BOT_TOKEN — token del bot (@BotFather)
 *   TELEGRAM_CHAT_ID   — id del canal privado (-100...) donde se archivan
 */
import { obtenerCredenciales } from '../_telegram.js'

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

/* Detecta el tipo real por los bytes (magic numbers). Solo se aceptan
   imágenes rasterizadas; SVG queda excluido a propósito (riesgo de XSS). */
function detectarImagen(buf) {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { ext: 'jpg', tipo: 'image/jpeg' }
  }
  if (buf.length > 7 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return { ext: 'png', tipo: 'image/png' }
  }
  if (buf.length > 11 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    return { ext: 'webp', tipo: 'image/webp' }
  }
  if (buf.length > 5 && (buf.toString('ascii', 0, 6) === 'GIF87a' || buf.toString('ascii', 0, 6) === 'GIF89a')) {
    return { ext: 'gif', tipo: 'image/gif' }
  }
  return null
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Tipo, X-Nombre')
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const cred = await obtenerCredenciales()
  if (!cred) return res.status(501).json({ error: 'Telegram no configurado' })
  const { token, chatId } = cred

  try {
    const buffer = await leerCuerpo(req)
    if (!buffer.length) return res.status(400).json({ error: 'Cuerpo vacío' })
    if (buffer.length > MAX_BYTES) return res.status(413).json({ error: 'Imagen demasiado grande' })

    // El tipo lo deciden los BYTES, nunca los headers del cliente
    const img = detectarImagen(buffer)
    if (!img) return res.status(415).json({ error: 'Solo se aceptan imágenes JPEG, PNG, WebP o GIF' })

    const base = String(req.headers['x-nombre'] || `imagen_${Date.now()}`)
      .replace(/\.[^.]*$/, '')
      .replace(/[^\w\-]/g, '_')
      .slice(0, 60) || `imagen_${Date.now()}`
    const nombre = `${base}.${img.ext}`

    // sendDocument conserva los bytes originales (sin recompresión de Telegram)
    const form = new FormData()
    form.append('chat_id', chatId)
    form.append('disable_notification', 'true')
    form.append('document', new Blob([buffer], { type: img.tipo }), nombre)

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
