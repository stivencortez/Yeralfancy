import { Heart, ShoppingBag, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCarrito } from '../../store/useCarrito'
import { useFavoritos } from '../../store/useFavoritos'
import { formatearPrecio } from '../../utils/formatear'

export function TarjetaProducto({ producto, onAgregarAlCarrito }) {
  const agregarAlCarrito = useCarrito(s => s.agregarAlCarrito)
  const { toggleFavorito, esFavorito } = useFavoritos()
  const esFav = esFavorito(producto.id)
  const sinStock = producto.stock === 0
  const bajoStock = !sinStock && producto.stock <= producto.stockMinimo

  const manejarAgregar = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!sinStock) {
      agregarAlCarrito(producto)
      onAgregarAlCarrito?.()
    }
  }

  const manejarFavorito = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorito(producto.id)
  }

  return (
    <Link to={`/producto/${producto.id}`} className="block group">
      <div className="bg-white rounded-2xl overflow-hidden shadow-tarjeta hover:shadow-tarjeta-hover transition-all duration-300">
        <div className="relative aspect-square overflow-hidden bg-marca-beige">
          {producto.fotos?.[0] ? (
            <img
              src={producto.fotos[0]}
              alt={producto.nombre}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-marca-beige">
              <ShoppingBag size={32} className="text-marca-beige-borde" />
            </div>
          )}

          <button
            onClick={manejarFavorito}
            className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform"
          >
            <Heart
              size={14}
              className={esFav ? 'text-red-500 fill-red-500' : 'text-marca-texto-suave'}
              strokeWidth={esFav ? 0 : 2}
            />
          </button>

          {sinStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="bg-white text-marca-texto text-xs font-semibold px-3 py-1 rounded-full shadow">Agotado</span>
            </div>
          )}

          {bajoStock && !sinStock && (
            <div className="absolute bottom-2 left-2">
              <span className="bg-amber-50 text-amber-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                Pocas unidades
              </span>
            </div>
          )}
        </div>

        <div className="p-3">
          <p className="text-xs text-marca-texto-suave mb-0.5 truncate">Yeral fancy</p>
          <h3 className="text-sm font-semibold text-marca-negro leading-tight line-clamp-2 mb-2">{producto.nombre}</h3>
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-marca-marron-oscuro">{formatearPrecio(producto.precioVenta)}</span>
            <button
              onClick={manejarAgregar}
              disabled={sinStock}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                sinStock
                  ? 'bg-marca-beige text-marca-texto-suave cursor-not-allowed'
                  : 'bg-marca-negro text-white hover:bg-marca-marron-oscuro'
              }`}
            >
              <ShoppingBag size={14} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
