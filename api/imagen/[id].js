/**
 * GET /api/imagen/<file_id> — sirve una imagen archivada en Telegram.
 * Resuelve file_id → file_path con getFile y transmite los bytes, con
 * cache agresivo del CDN de Vercel (Telegram casi nunca se consulta).
 * El token del bot nunca llega al navegador.
 */
const TIPOS = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml',
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return res.status(501).json({ error: 'Telegram no configurado' })

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

    res.setHeader('Content-Type', TIPOS[ext] || 'application/octet-stream')
    res.setHeader('Content-Length', String(buffer.length))
    res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable')
    return res.status(200).send(buffer)
  } catch (e) {
    return res.status(502).json({ error: e.message })
  }
}
