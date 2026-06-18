import { useParams, Link } from 'react-router-dom'
import { CheckCircle, MessageCircle, ShoppingBag } from 'lucide-react'
import { usePedidos } from '../../store/usePedidos'
import { useConfig } from '../../store/useConfig'
import { formatearPrecio, formatearFechaHora } from '../../utils/formatear'
import { construirMensajeWhatsApp, abrirWhatsApp } from '../../utils/whatsapp'

export default function PedidoCreado() {
  const { id } = useParams()
  const pedido = usePedidos(s => s.getPedido(id))
  const whatsapp = useConfig(s => s.config.whatsapp)

  if (!pedido) {
    return (
      <div className="contenedor py-16 text-center">
        <p className="font-semibold">Pedido no encontrado</p>
        <Link to="/" className="btn-primario mt-4 inline-flex">Volver a la tienda</Link>
      </div>
    )
  }

  const reenviarWhatsApp = () => {
    const mensaje = construirMensajeWhatsApp({
      clienteNombre: pedido.clienteNombre,
      clienteTelefono: pedido.clienteTelefono,
      items: pedido.productos.map(p => ({ ...p, productoId: p.productoId, precioVenta: p.precioVenta })),
      total: pedido.total,
    })
    abrirWhatsApp(whatsapp, mensaje)
  }

  return (
    <div className="contenedor py-8 max-w-md mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h1 className="font-bold text-2xl text-marca-negro mb-2">¡Pedido creado!</h1>
        <p className="text-marca-texto-suave text-sm">
          Tu pedido fue registrado. Revisa WhatsApp para confirmar y coordinar el pago.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-tarjeta p-4 mb-4">
        <div className="flex justify-between text-xs text-marca-texto-suave mb-3">
          <span>Pedido #{pedido.id.slice(-6).toUpperCase()}</span>
          <span>{formatearFechaHora(pedido.creadoEn)}</span>
        </div>
        <div className="space-y-2 mb-3">
          {pedido.productos.map((p, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-marca-texto truncate flex-1 mr-2">{p.nombre} ×{p.cantidad}</span>
              <span className="font-medium text-marca-negro shrink-0">{formatearPrecio(p.precioVenta * p.cantidad)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-marca-beige-borde pt-3 flex justify-between font-bold">
          <span>Total</span>
          <span className="text-marca-marron-oscuro">{formatearPrecio(pedido.total)}</span>
        </div>
      </div>

      <div className="space-y-3">
        <button onClick={reenviarWhatsApp} className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all">
          <MessageCircle size={20} />
          Abrir WhatsApp nuevamente
        </button>
        <Link to="/" className="w-full btn-secundario py-4 flex items-center justify-center gap-2">
          <ShoppingBag size={18} />
          Seguir comprando
        </Link>
      </div>
    </div>
  )
}
