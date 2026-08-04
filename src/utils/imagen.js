/**
 * Devuelve la URL de la imagen lista para usar.
 *
 * NOTA DE OPTIMIZACIÓN: La API de transformación de Supabase
 * (/render/image/public/) es muy lenta en el plan gratuito y causaba
 * que las imágenes tardaran varios segundos en cargar (o fallaran).
 * Las imágenes ya se comprimen y redimensionan en el navegador antes
 * de subirse (ver supabase.js), por lo que la URL original es suficiente.
 *
 * Si en el futuro se activa el plan Pro de Supabase, descomentar la
 * línea con /render/image/public/ para habilitar el CDN de imágenes.
 */
export function imgSrc(url, _width = 800, _quality = 80) {
  if (!url) return ''
  // Retorna la URL original directamente (ya está comprimida al subirse)
  return url
  // Pro plan: return url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/') + `?width=${_width}&quality=${_quality}&resize=cover`
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
 * Object-position saved in producto.capa, for cards that use object-cover.
 * Only the focal point is applied — zoom/scale is left out on purpose,
 * since it made cover images look zoomed in.
 */
export function posicionCapa(capa) {
  if (!capa) return undefined
  if ((Number(capa.zoom) || 1) !== 1) return undefined
  const x = clampPct(capa.x)
  const y = clampPct(capa.y)
  if (x === 50 && y === 50) return undefined
  return `${x}% ${y}%`
}

/**
 * Retorna las clases y estilos inline necesarios para renderizar
 * la imagen según las preferencias de fit y zoom guardadas en capa.
 */
export function estiloCapa(capa, defaultFit = 'contain') {
  if (!capa) return { className: `w-full h-full object-${defaultFit}`, style: {} }
  
  const fit = capa.fit === 'cover' ? 'object-cover' : capa.fit === 'contain' ? 'object-contain' : `object-${defaultFit}`
  const scale = (Number(capa.zoom) || 1) > 1 ? Number(capa.zoom) : 1
  
  const x = clampPct(capa.x)
  const y = clampPct(capa.y)
  const objectPosition = (x === 50 && y === 50) ? undefined : `${x}% ${y}%`
  
  return {
    className: `w-full h-full ${fit}`,
    style: {
      objectPosition,
      transform: scale > 1 ? `scale(${scale})` : undefined
    }
  }
}

function clampPct(v) {
  const n = Number(v)
  if (!Number.isFinite(n)) return 50
  return Math.min(100, Math.max(0, n))
}
