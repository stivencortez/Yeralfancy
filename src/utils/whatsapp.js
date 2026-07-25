import { formatearPrecio } from './formatear'

export function construirMensajeWhatsApp({ clienteNombre, clienteTelefono, clienteCiudad, items, total, descuento, codigoCupon }) {
  const lineasProductos = items.map(item =>
    `• [#${item.productoId}] ${item.nombre} x${item.cantidad} — ${formatearPrecio(item.precioVenta * item.cantidad)}`
  ).join('\n')

  const subtotal = items.reduce((a, i) => a + i.precioVenta * i.cantidad, 0)
  const lineaDescuento = descuento > 0 ? `\n🏷️ Cupón *${codigoCupon}*: -${formatearPrecio(descuento)}` : ''

  const lineaCiudad = clienteCiudad ? `\n\n📍 Ciudad: *${clienteCiudad}*` : ''

  const mensaje = `Hola, soy *${clienteNombre}*. Quiero finalizar esta compra en *Yeral fancy* 🛍️

*Productos:*
${lineasProductos}
${descuento > 0 ? `\nSubtotal: ${formatearPrecio(subtotal)}` : ''}${lineaDescuento}

*Total: ${formatearPrecio(total)}*${lineaCiudad}

Quedo en espera de su confirmación. ¡Gracias!`

  return mensaje
}

/* Si se pasa una ventana pre-abierta (abierta de forma síncrona dentro del
   gesto del usuario), se redirige esa ventana: window.open después de un
   await es bloqueado por el bloqueador de popups de Safari/iOS. */
export function abrirWhatsApp(numeroWhatsApp, mensaje, ventana = null) {
  const numero = numeroWhatsApp.replace(/\D/g, '')
  const numeroConPais = numero.startsWith('58') ? numero : `58${numero.replace(/^0/, '')}`
  const mensajeCodificado = encodeURIComponent(mensaje)
  const url = `https://wa.me/${numeroConPais}?text=${mensajeCodificado}`
  if (ventana && !ventana.closed) {
    ventana.location.href = url
    return
  }
  window.open(url, '_blank')
}
