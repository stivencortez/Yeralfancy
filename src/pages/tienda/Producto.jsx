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

  const prevFoto = () => setFotoActual(i => (i - 1 + fotos.length) % fotos.length)
  const nextFoto = () => setFotoActual(i => (i + 1) % fotos.length)

  const badgeStock = (lg = false) => {
    const base = `text-xs font-semibold rounded-full ${lg ? 'px-3.5 py-1.5' : 'px-3 py-1'}`
    if (sinStock) return <span className={`bg-red-50 text-red-600 ${base}`}>Agotado</span>
    if (bajoStock) return <span className={`bg-amber-50 text-amber-700 ${base}`}>Pocas unidades</span>
    return <span className={`bg-emerald-50 text-emerald-700 ${base}`}>Disponible</span>
  }

  return (
    <div className="animate-fade-in">

      {/* ══════════════════════════════════════════════════
          MOBILE  — layout original intacto  (< 1024px)
      ══════════════════════════════════════════════════ */}
      <div className="lg:hidden">
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
                <button onClick={prevFoto}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={nextFoto}
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
            {badgeStock()}
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
      </div>

      {/* ══════════════════════════════════════════════════
          DESKTOP  — dos columnas profesional  (≥ 1024px)
      ══════════════════════════════════════════════════ */}
      <div className="hidden lg:block">
        <div className="contenedor py-8 lg:py-10">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 mb-8 text-sm text-marca-texto-suave select-none">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 hover:text-marca-negro transition-colors"
            >
              <ArrowLeft size={15} />
              Volver
            </button>
            {categoria && (
              <>
                <span className="opacity-40">/</span>
                <Link
                  to={`/categorias/${categoria.id}`}
                  className="hover:text-marca-marron transition-colors"
                >
                  {categoria.nombre}
                </Link>
              </>
            )}
            <span className="opacity-40">/</span>
            <span className="text-marca-negro font-medium truncate max-w-[320px]">
              {producto.nombre}
            </span>
          </nav>

          {/* Grid principal */}
          <div className="grid grid-cols-[55fr_45fr] gap-14 items-start">

            {/* ── Columna izquierda: galería ── */}
            <div className="space-y-4">
              {/* Imagen principal */}
              <div className="relative bg-marca-beige rounded-2xl overflow-hidden h-[560px]">
                {fotos.length ? (
                  <img
                    src={fotos[fotoActual]}
                    alt={producto.nombre}
                    className="w-full h-full object-cover transition-opacity duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag size={72} className="text-marca-beige-borde" />
                  </div>
                )}

                {fotos.length > 1 && (
                  <>
                    <button
                      onClick={prevFoto}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:shadow-md transition-all"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={nextFoto}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:shadow-md transition-all"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}

                <button
                  onClick={() => toggleFavorito(producto.id)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white hover:scale-110 transition-all"
                >
                  <Heart size={18} className={esFav ? 'text-red-500 fill-red-500' : 'text-marca-texto'} />
                </button>
              </div>

              {/* Miniaturas */}
              {fotos.length > 1 && (
                <div className="flex gap-3 flex-wrap">
                  {fotos.map((f, i) => (
                    <button
                      key={i}
                      onClick={() => setFotoActual(i)}
                      className={`w-[70px] h-[70px] rounded-xl overflow-hidden border-2 transition-all duration-200 hover:border-marca-marron hover:scale-105 ${
                        i === fotoActual
                          ? 'border-marca-marron ring-2 ring-marca-marron/20 scale-105'
                          : 'border-marca-beige-borde'
                      }`}
                    >
                      <img src={f} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Columna derecha: información y acciones ── */}
            <div className="sticky top-24 space-y-5">

              {/* Categoría */}
              {categoria && (
                <Link
                  to={`/categorias/${categoria.id}`}
                  className="text-xs text-marca-marron font-semibold uppercase tracking-widest hover:text-marca-marron-oscuro transition-colors"
                >
                  {categoria.nombre}
                </Link>
              )}

              {/* Nombre */}
              <h1 className="font-bold text-[2rem] text-marca-negro leading-tight">
                {producto.nombre}
              </h1>

              {/* Precio + badge */}
              <div className="flex items-center gap-4">
                <span className="text-[2rem] font-bold text-marca-marron-oscuro leading-none">
                  {formatearPrecio(producto.precioVenta)}
                </span>
                {badgeStock(true)}
              </div>

              {/* Descripción */}
              {producto.descripcion && (
                <div className="pb-5 border-b border-marca-beige-borde">
                  <p className="text-[0.9375rem] text-marca-texto-suave leading-relaxed">
                    {producto.descripcion}
                  </p>
                </div>
              )}

              {/* Cantidad */}
              {!sinStock && (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-marca-negro">Cantidad</span>
                  <div className="flex items-center gap-3 bg-marca-beige rounded-xl px-4 py-2">
                    <button
                      onClick={() => setCantidad(c => Math.max(1, c - 1))}
                      className="w-7 h-7 rounded-lg bg-white flex items-center justify-center font-bold text-lg leading-none hover:bg-marca-marron/10 active:scale-90 transition-all"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold">{cantidad}</span>
                    <button
                      onClick={() => setCantidad(c => Math.min(producto.stock, c + 1))}
                      className="w-7 h-7 rounded-lg bg-white flex items-center justify-center font-bold text-lg leading-none hover:bg-marca-marron/10 active:scale-90 transition-all"
                    >
                      +
                    </button>
                  </div>
                  {producto.stock > 0 && (
                    <span className="text-xs text-marca-texto-suave">{producto.stock} en stock</span>
                  )}
                </div>
              )}

              {/* Botones de compra */}
              {sinStock ? (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-center">
                  <p className="text-red-600 font-medium">Producto agotado por el momento.</p>
                  <p className="text-red-400 text-sm mt-1">Escríbenos por WhatsApp para más información.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 pt-1">
                  <button
                    onClick={manejarComprarAhora}
                    className="btn-primario flex items-center justify-center gap-2.5 py-4 text-base rounded-2xl hover:scale-[1.015] transition-transform"
                  >
                    <Zap size={20} />
                    Comprar ahora
                  </button>
                  <button
                    onClick={manejarAgregar}
                    className="btn-outline flex items-center justify-center gap-2.5 py-4 text-base rounded-2xl hover:scale-[1.015] transition-transform"
                  >
                    <ShoppingBag size={20} />
                    Agregar al carrito
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          PRODUCTOS RELACIONADOS  (compartido mobile + desktop)
      ══════════════════════════════════════════════════ */}
      {relacionados.length > 0 && (
        <div className="contenedor py-6 mt-2 border-t border-marca-beige-borde">
          <h2 className="font-bold text-base text-marca-negro mb-4 lg:text-lg lg:mb-5">
            También te puede gustar
          </h2>
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
