/**
 * Converts a Supabase Storage URL to use the image render endpoint,
 * which serves a resized/compressed version via CDN.
 * Falls back to the original URL for non-Supabase images.
 */
export function imgSrc(url, width = 800, quality = 80) {
  if (!url) return ''
  if (!url.includes('/storage/v1/object/public/')) return url
  return (
    url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/') +
    `?width=${width}&quality=${quality}&resize=cover`
  )
}

/**
 * Returns the URL of the product's cover photo (the one chosen in
 * producto.capa.indice), falling back to the first photo.
 */
export function fotoCapa(producto) {
  const fotos = producto?.fotos || []
  const i = producto?.capa?.indice
  return (Number.isInteger(i) && fotos[i]) || fotos[0] || ''
}

/**
 * Inline style that applies the cover framing (focal point + zoom) saved in
 * producto.capa to an <img> with object-cover. Returns undefined when the
 * framing is the default so hover/transition classes keep working.
 */
export function estiloCapa(capa) {
  if (!capa) return undefined
  const x = clampPct(capa.x)
  const y = clampPct(capa.y)
  const zoom = Math.min(3, Math.max(1, Number(capa.zoom) || 1))
  if (zoom === 1 && x === 50 && y === 50) return undefined
  return {
    objectPosition: `${x}% ${y}%`,
    transform: `scale(${zoom})`,
    transformOrigin: `${x}% ${y}%`,
  }
}

function clampPct(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return 50
  return Math.min(100, Math.max(0, n))
}
