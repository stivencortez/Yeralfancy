import { useState } from 'react'
import { Heart, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useFavoritos } from '../../store/useFavoritos'
import { useCategorias } from '../../store/useCategorias'
import { formatearPrecio } from '../../utils/formatear'
import { imgSrc, fotoCapa, estiloCapa } from '../../utils/imagen'

export function TarjetaProducto({ producto }) {
  const { toggleFavorito, esFavorito } = useFavoritos()
  const getCategoria = useCategorias(s => s.getCategoria)
  const categoria = getCategoria(producto.categoriaId)
  
  const esFav = esFavorito(producto.id)
  const sinStock = producto.stock === 0
  const bajoStock = !sinStock && producto.stock <= producto.stockMinimo
  const [imgCargada, setImgCargada] = useState(false)
  const fotoPortada = fotoCapa(producto)
  const estilos = estiloCapa(producto.capa, 'contain')

  const manejarFavorito = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorito(producto.id)
  }

  return (
    <Link to={`/producto/${producto.id}`} className="block group">
      <div className="flex flex-col gap-2.5 transition-all duration-300 active:scale-[0.98]">
        {/* Imagen */}
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#F8F6F2]">
          {/* Skeleton */}
          {!imgCargada && fotoPortada && (
            <div className="absolute inset-0 bg-[#F8F6F2] animate-pulse" />
          )}

          {fotoPortada ? (
            <img
              src={imgSrc(fotoPortada, 400, 80)}
              alt={producto.nombre}
              style={estilos.style}
              className={`${estilos.className} transition-opacity duration-500 ${imgCargada ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              decoding="async"
              onLoad={() => setImgCargada(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#F8F6F2]">
              <ShoppingBag size={32} className="text-marca-beige-borde" />
            </div>
          )}

          {/* Botón favorito */}
          <button
            onClick={manejarFavorito}
            className="absolute top-2.5 right-2.5 w-[30px] h-[30px] rounded-full bg-white flex items-center justify-center shadow-sm active:scale-90 transition-all duration-200"
          >
            <Heart
              size={15}
              className={esFav ? 'text-red-500 fill-red-500' : 'text-gray-400'}
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
        <div className="flex flex-col px-1">
          <h3 className="text-[13px] sm:text-sm font-bold text-marca-negro leading-tight line-clamp-1">{producto.nombre}</h3>
          {categoria ? (
            <p className="text-[11px] sm:text-xs text-marca-texto-suave mt-0.5">{categoria.nombre}</p>
          ) : (
            <p className="text-[11px] sm:text-xs text-marca-texto-suave mt-0.5 opacity-0">Sin categoría</p>
          )}
          <span className="text-[13px] sm:text-sm font-bold text-marca-negro mt-1.5">{formatearPrecio(producto.precioVenta)}</span>
        </div>
      </div>
    </Link>
  )
}
