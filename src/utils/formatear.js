export function formatearPrecio(precio) {
  return `$${Number(precio).toFixed(2)}`
}

export function formatearFecha(fechaISO) {
  if (!fechaISO) return '—'
  return new Date(fechaISO).toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatearFechaHora(fechaISO) {
  if (!fechaISO) return '—'
  return new Date(fechaISO).toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatearHora(fechaISO) {
  if (!fechaISO) return '—'
  return new Date(fechaISO).toLocaleTimeString('es-VE', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function calcularGanancia(precioCosto, precioVenta) {
  return precioVenta - precioCosto
}

export function calcularMargen(precioCosto, precioVenta) {
  if (precioCosto === 0) return 0
  return ((precioVenta - precioCosto) / precioVenta) * 100
}

export function generarId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function truncarTexto(texto, maxCaracteres = 80) {
  if (!texto) return ''
  return texto.length > maxCaracteres ? texto.slice(0, maxCaracteres) + '...' : texto
}

export function estadoColor(estado) {
  const colores = {
    'Pendiente': 'bg-yellow-100 text-yellow-800',
    'Esperando pago': 'bg-orange-100 text-orange-800',
    'Pago': 'bg-green-100 text-green-800',
    'En preparación': 'bg-blue-100 text-blue-800',
    'En envío': 'bg-indigo-100 text-indigo-800',
    'Entregado': 'bg-emerald-100 text-emerald-800',
    'No finalizado': 'bg-gray-100 text-gray-600',
    'Cancelado': 'bg-red-100 text-red-800',
  }
  return colores[estado] || 'bg-gray-100 text-gray-600'
}

export const ESTADOS_PEDIDO = [
  'Pendiente',
  'Esperando pago',
  'Pago',
  'En preparación',
  'En envío',
  'Entregado',
  'No finalizado',
  'Cancelado',
]
