import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { ArrowLeft, Heart, ShoppingBag, Zap, ChevronLeft, ChevronRight } from 'lucide-react'
import { TarjetaProducto } from '../../components/tienda/TarjetaProducto'
import { useTiendaToast } from '../../layouts/LayoutTienda'
import { useProductos } from '../../store/useProductos'
import { useCategorias } from '../../store/useCategorias'
import { useCarrito } from '../../store/useCarrito'
import { useFavoritos } from '../../store/useFavoritos'
import { formatearPrecio } from '../../utils/formatear'

export default function Producto() {
  const { id } = useParams()
  const navigate = useNavigate()
  const mostrarToast = useTiendaToast()
  const producto = useProductos(s => s.getProducto(id))
  const productos = useProductos(s => s.getProductosActivos())
  const getCat = useCategorias(s => s.getCategoria)
  const agregarAlCarrito = useCarrito(s => s.agregarAlCarrito)
  const { toggleFavorito, esFavorito } = useFavoritos()
  const [fotoActual, setFotoActual] = useState(0)
  const [cantidad, setCantidad] = useState(1)

  if (!producto) {
    return (
      <div className="contenedor py-16 text-center">
        <p className="font-semibold">Producto no encontrado</p>
        <button onClick={() => navigate(-1)} className="btn-primario mt-4">Volver</button>
      </div>
    )
  }

  const categoria = getCat(producto.categoriaId)
  const esFav = esFavorito(producto.id)
  const sinStock = producto.stock === 0
  const bajoStock = !sinStock && producto.stock <= producto.stockMinimo
  const fotos = producto.fotos?.length ? producto.fotos : []
  const relacionados = productos.filter(p => p.id !== id && p.categoriaId === producto.categoriaId).slice(0, 4)

  const manejarAgregar = () => {
    if (sinStock) return
    agregarAlCarrito(producto, cantidad)
    mostrarToast('Producto agregado al carrito', 'exito')
  }

  const manejarComprarAhora = () => {
    if (sinStock) return
    agregarAlCarrito(producto, cantidad)
    navigate('/carrito')
  }

  return (
    <div className="animate-fade-in">
      <div className="relative bg-marca-beige">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow"
        >
          <ArrowLeft size={18} />
        </button>
        <button
          onClick={() => toggleFavorito(producto.id)}
          className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow"
        >
          <Heart size={18} className={esFav ? 'text-red-500 fill-red-500' : 'text-marca-texto'} />
        </button>

        <div className="relative aspect-square overflow-hidden">
          {fotos.length ? (
            <img
              src={fotos[fotoActual]}
              alt={producto.nombre}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag size={48} className="text-marca-beige-borde" />
            </div>
          )}
          {fotos.length > 1 && (
            <>
              <button onClick={() => setFotoActual(i => (i - 1 + fotos.length) % fotos.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setFotoActual(i => (i + 1) % fotos.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center">
                <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>

        {fotos.length > 1 && (
          <div className="flex gap-2 px-4 py-3 overflow-x-auto">
            {fotos.map((f, i) => (
              <button key={i} onClick={() => setFotoActual(i)}
                className={`shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${i === fotoActual ? 'border-marca-marron' : 'border-transparent'}`}>
                <img src={f} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="contenedor py-4">
        {categoria && (
          <Link to={`/categorias/${categoria.id}`} className="text-xs text-marca-marron font-medium mb-1 block">
            {categoria.nombre}
          </Link>
        )}
        <h1 className="font-bold text-xl text-marca-negro mb-2">{producto.nombre}</h1>
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-marca-marron-oscuro">{formatearPrecio(producto.precioVenta)}</span>
          {sinStock ? (
            <span className="bg-red-50 text-red-600 text-xs font-semibold px-3 py-1 rounded-full">Agotado</span>
          ) : bajoStock ? (
            <span className="bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full">Pocas unidades</span>
          ) : (
            <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">Disponible</span>
          )}
        </div>

        {producto.descripcion && (
          <div className="mb-5">
            <h2 className="font-semibold text-sm text-marca-negro mb-2">Descripción</h2>
            <p className="text-sm text-marca-texto-suave leading-relaxed">{producto.descripcion}</p>
          </div>
        )}

        {!sinStock && (
          <div className="flex items-center gap-3 mb-5">
            <span className="text-sm font-medium text-marca-negro">Cantidad:</span>
            <div className="flex items-center gap-2 bg-marca-beige rounded-xl px-3 py-1.5">
              <button onClick={() => setCantidad(c => Math.max(1, c - 1))} className="w-6 h-6 rounded-lg bg-white flex items-center justify-center font-bold text-lg leading-none active:scale-90 transition-transform">−</button>
              <span className="w-6 text-center font-semibold text-sm">{cantidad}</span>
              <button onClick={() => setCantidad(c => Math.min(producto.stock, c + 1))} className="w-6 h-6 rounded-lg bg-white flex items-center justify-center font-bold text-lg leading-none active:scale-90 transition-transform">+</button>
            </div>
          </div>
        )}

        {sinStock ? (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center mb-4">
            <p className="text-red-600 font-medium text-sm">Producto agotado por el momento.</p>
            <p className="text-red-400 text-xs mt-1">Escríbenos por WhatsApp para más información.</p>
          </div>
        ) : (
          <div className="flex gap-3">
            <button onClick={manejarAgregar} className="flex-1 btn-outline flex items-center justify-center gap-2 py-3.5">
              <ShoppingBag size={18} />
              Agregar al carrito
            </button>
            <button onClick={manejarComprarAhora} className="flex-1 btn-primario flex items-center justify-center gap-2 py-3.5">
              <Zap size={18} />
              Comprar ahora
            </button>
          </div>
        )}
      </div>

      {relacionados.length > 0 && (
        <div className="contenedor py-4 border-t border-marca-beige-borde">
          <h2 className="font-bold text-base text-marca-negro mb-4">También te puede gustar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {relacionados.map(p => (
              <TarjetaProducto
                key={p.id}
                producto={p}
                onAgregarAlCarrito={() => mostrarToast('Producto agregado al carrito', 'exito')}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
