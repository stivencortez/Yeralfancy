/**
 * GET /api/imagen/<file_id> — sirve una imagen archivada en Telegram.
 * Resuelve file_id → file_path con getFile y transmite los bytes, con
 * cache agresivo del CDN de Vercel (Telegram casi nunca se consulta).
 * El token del bot nunca llega al navegador.
 */
import { obtenerCredenciales } from '../_telegram.js'

/* Solo imágenes rasterizadas — SVG excluido a propósito (riesgo de XSS) */
const TIPOS = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  webp: 'image/webp', gif: 'image/gif',
}

function tipoPorBytes(b) {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg'
  if (b[0] === 0x89 && b.toString('latin1', 1, 4) === 'PNG') return 'image/png'
  if (b.toString('latin1', 0, 3) === 'GIF') return 'image/gif'
  if (b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WEBP') return 'image/webp'
  return null
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const cred = await obtenerCredenciales()
  if (!cred) return res.status(501).json({ error: 'Telegram no configurado' })
  const token = cred.token

  const id = req.query.id
  if (!id || !/^[\w-]{10,200}$/.test(id)) return res.status(400).json({ error: 'Identificador inválido' })

  try {
    const info = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${encodeURIComponent(id)}`)
      .then(r => r.json())
    if (!info.ok || !info.result?.file_path) {
      return res.status(404).json({ error: 'Imagen no encontrada' })
    }

    const archivo = await fetch(`https://api.telegram.org/file/bot${token}/${info.result.file_path}`)
    if (!archivo.ok) return res.status(502).json({ error: 'No se pudo descargar de Telegram' })

    const buffer = Buffer.from(await archivo.arrayBuffer())
    const ext = (info.result.file_path.split('.').pop() || '').toLowerCase()
    // sendDocument guarda archivos sin extensión de imagen: se detecta por los bytes reales
    const tipo = tipoPorBytes(buffer) || TIPOS[ext]

    res.setHeader('Content-Type', tipo || 'application/octet-stream')
    res.setHeader('Content-Length', String(buffer.length))
    res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Content-Security-Policy', "default-src 'none'")
    if (!tipo) res.setHeader('Content-Disposition', 'attachment')
    return res.status(200).send(buffer)
  } catch (e) {
    return res.status(502).json({ error: e.message })
  }
}
