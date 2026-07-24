import { useState } from 'react'
import { Heart, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCarrito } from '../../store/useCarrito'
import { useFavoritos } from '../../store/useFavoritos'
import { formatearPrecio } from '../../utils/formatear'
import { imgSrc, fotoCapa } from '../../utils/imagen'

export function TarjetaProducto({ producto, onAgregarAlCarrito }) {
  const agregarAlCarrito = useCarrito(s => s.agregarAlCarrito)
  const { toggleFavorito, esFavorito } = useFavoritos()
  const esFav = esFavorito(producto.id)
  const sinStock = producto.stock === 0
  const bajoStock = !sinStock && producto.stock <= producto.stockMinimo
  const [imgCargada, setImgCargada] = useState(false)
  const fotoPortada = fotoCapa(producto)

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
      <div className="bg-[#F8F6F2] rounded-[20px] overflow-hidden transition-all duration-300 active:scale-[0.97]">
        {/* Imagen */}
        <div className="relative aspect-[4/5] overflow-hidden bg-marca-beige">
          {/* Skeleton */}
          {!imgCargada && fotoPortada && (
            <div className="absolute inset-0 bg-marca-beige animate-pulse" />
          )}

          {fotoPortada ? (
            <img
              src={imgSrc(fotoPortada, 400, 80)}
              alt={producto.nombre}
              className={`w-full h-full object-cover transition-opacity duration-500 ${imgCargada ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              decoding="async"
              onLoad={() => setImgCargada(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-marca-beige">
              <ShoppingBag size={32} className="text-marca-beige-borde" />
            </div>
          )}

          {/* Botón favorito */}
          <button
            onClick={manejarFavorito}
            className={`absolute top-2.5 left-2.5 w-8 h-8 rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-all duration-200
              ${esFav ? 'bg-marca-negro' : 'bg-white/90 backdrop-blur-sm'}`}
          >
            <Heart
              size={14}
              className={esFav ? 'text-white fill-white' : 'text-marca-texto-suave'}
              strokeWidth={esFav ? 0 : 2}
            />
          </button>

          {sinStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="bg-white text-marca-texto text-xs font-semibold px-3 py-1 rounded-full shadow-sm">Agotado</span>
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

        {/* Info */}
        <div className="p-3">
          <h3 className="text-sm font-semibold text-marca-negro leading-tight line-clamp-2 mb-2">{producto.nombre}</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-marca-marron-oscuro">{formatearPrecio(producto.precioVenta)}</span>
            <button
              onClick={manejarAgregar}
              disabled={sinStock}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 duration-150 ${
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
