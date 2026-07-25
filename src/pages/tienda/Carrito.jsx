import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, ShoppingBag, ArrowLeft } from 'lucide-react'
import { useCarrito } from '../../store/useCarrito'
import { useProductos } from '../../store/useProductos'
import { formatearPrecio } from '../../utils/formatear'
import { EstadoVacio } from '../../components/ui/Cargando'

export default function Carrito() {
  const { items, quitarDelCarrito, cambiarCantidad, getTotal, getTotalItems, sincronizarConCatalogo } = useCarrito()
  const productos = useProductos(s => s.productos)
  const navigate = useNavigate()

  useEffect(() => { sincronizarConCatalogo(productos) }, [productos, sincronizarConCatalogo])

  if (!items.length) {
    return (
      <EstadoVacio
        icono="🛍️"
        titulo="Tu carrito está vacío"
        descripcion="Agrega productos a tu carrito para continuar comprando."
        accion={
          <Link to="/" className="btn-primario mt-4 inline-flex items-center gap-2">
            <ShoppingBag size={16} />
            Explorar tienda
          </Link>
        }
      />
    )
  }

  const total = getTotal()

  return (
    <div className="contenedor py-4 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-marca-beige transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-xl text-marca-negro">Carrito ({getTotalItems()})</h1>
      </div>

      <div className="space-y-3 mb-5">
        {items.map(item => (
          <div key={item.productoId} className="bg-white rounded-2xl p-3 flex gap-3 shadow-tarjeta animate-slide-up">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-marca-beige shrink-0">
              {item.foto ? (
                <img src={item.foto} alt={item.nombre} className="w-full h-full object-cover" style={item.posicion ? { objectPosition: item.posicion } : undefined} />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag size={20} className="text-marca-beige-borde" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <Link to={`/producto/${item.productoId}`} className="font-semibold text-sm text-marca-negro line-clamp-2 leading-tight hover:text-marca-marron transition-colors">
                {item.nombre}
              </Link>
              <p className="text-marca-marron font-bold text-sm mt-1">{formatearPrecio(item.precioVenta)}</p>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2 bg-marca-beige rounded-xl px-2 py-1">
                  <button
                    onClick={() => cambiarCantidad(item.productoId, item.cantidad - 1)}
                    className="w-6 h-6 rounded-lg bg-white flex items-center justify-center font-bold text-base leading-none active:scale-90 transition-transform"
                  >−</button>
                  <span className="w-5 text-center text-sm font-semibold">{item.cantidad}</span>
                  <button
                    onClick={() => cambiarCantidad(item.productoId, Math.min(item.stock, item.cantidad + 1))}
                    className="w-6 h-6 rounded-lg bg-white flex items-center justify-center font-bold text-base leading-none active:scale-90 transition-transform"
                  >+</button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-marca-negro">{formatearPrecio(item.precioVenta * item.cantidad)}</span>
                  <button
                    onClick={() => quitarDelCarrito(item.productoId)}
                    className="w-7 h-7 rounded-xl bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-100 active:scale-90 transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-tarjeta mb-4">
        <div className="space-y-2 mb-3">
          <div className="flex justify-between text-sm">
            <span className="text-marca-texto-suave">Subtotal ({getTotalItems()} artículos)</span>
            <span className="font-medium text-marca-negro">{formatearPrecio(total)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-marca-texto-suave">Envío</span>
            <span className="text-marca-texto-suave">A coordinar por WhatsApp</span>
          </div>
        </div>
        <div className="border-t border-marca-beige-borde pt-3 flex justify-between">
          <span className="font-bold text-marca-negro">Total</span>
          <span className="font-bold text-xl text-marca-marron-oscuro">{formatearPrecio(total)}</span>
        </div>
      </div>

      <button
        onClick={() => navigate('/checkout')}
        className="w-full btn-primario py-4 text-base flex items-center justify-center gap-2"
      >
        Finalizar compra
      </button>
      <Link to="/" className="w-full btn-outline py-3 text-sm flex items-center justify-center gap-2 mt-3">
        Seguir comprando
      </Link>
    </div>
  )
}
