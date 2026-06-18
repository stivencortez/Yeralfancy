import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { CarruselBanners } from '../../components/tienda/CarruselBanners'
import { TarjetaProducto } from '../../components/tienda/TarjetaProducto'
import { useTiendaToast } from '../../layouts/LayoutTienda'
import { useProductos } from '../../store/useProductos'
import { useCategorias } from '../../store/useCategorias'

/* ─── Chips de categorías (mobile) ─── */
function CategoriasChips({ categorias }) {
  return (
    <section className="mb-6 lg:hidden">
      <div className="flex gap-2 overflow-x-auto pb-1 px-4" style={{ scrollbarWidth: 'none' }}>
        <Link
          to="/categorias"
          className="shrink-0 px-4 py-2 rounded-full text-sm font-semibold bg-marca-negro text-white transition-all duration-200 active:scale-95"
        >
          Todos
        </Link>
        {categorias.map((cat) => (
          <Link
            key={cat.id}
            to={`/categorias/${cat.id}`}
            className="shrink-0 px-4 py-2 rounded-full text-sm font-medium bg-[#F0EAE0] text-marca-texto-suave border border-marca-beige-borde hover:border-marca-marron hover:text-marca-negro transition-all duration-200 active:scale-95 whitespace-nowrap"
          >
            {cat.nombre}
          </Link>
        ))}
      </div>
    </section>
  )
}

/* ─── Grid de categorías (desktop) ─── */
function CategoriasGrid({ categorias }) {
  const coloresBg = [
    'bg-rose-50', 'bg-amber-50', 'bg-emerald-50', 'bg-sky-50',
    'bg-violet-50', 'bg-pink-50', 'bg-teal-50', 'bg-orange-50',
  ]
  return (
    <section className="mb-8 hidden lg:block">
      <div className="contenedor mb-4">
        <h2 className="font-bold text-marca-negro text-lg">Categorías</h2>
      </div>
      <div className="contenedor grid grid-cols-4 xl:grid-cols-8 gap-3">
        {categorias.map((cat, i) => (
          <Link
            key={cat.id}
            to={`/categorias/${cat.id}`}
            className="group flex flex-col items-center gap-2"
          >
            <div className={`w-full aspect-square rounded-2xl overflow-hidden ${coloresBg[i % coloresBg.length]} transition-transform duration-200 group-hover:scale-105`}>
              {cat.imagen ? (
                <img src={cat.imagen} alt={cat.nombre} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">💎</div>
              )}
            </div>
            <span className="text-xs text-marca-texto font-medium text-center w-full truncate">{cat.nombre}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

/* ─── Sección de productos ─── */
function SeccionProductos({ titulo, productos, enlace }) {
  const mostrarToast = useTiendaToast()
  if (!productos.length) return null

  return (
    <section className="mb-8">
      {/* Encabezado */}
      <div className="contenedor flex items-center justify-between mb-3 lg:mb-4">
        <h2 className="font-bold text-marca-negro text-base lg:text-lg">{titulo}</h2>
        {enlace && (
          <Link
            to={enlace}
            className="flex items-center gap-0.5 text-xs text-marca-marron font-semibold hover:text-marca-marron-oscuro transition-colors"
          >
            Ver todo <ChevronRight size={14} />
          </Link>
        )}
      </div>

      {/* Mobile: scroll horizontal con snap */}
      <div
        className="flex gap-3 overflow-x-auto pb-2 px-4 lg:hidden snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none' }}
      >
        {productos.slice(0, 10).map(p => (
          <div key={p.id} className="shrink-0 w-[160px] snap-start">
            <TarjetaProducto
              producto={p}
              onAgregarAlCarrito={() => mostrarToast('Producto agregado al carrito', 'exito')}
            />
          </div>
        ))}
      </div>

      {/* Desktop: grid */}
      <div className="contenedor hidden lg:grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-5 gap-4">
        {productos.slice(0, 5).map(p => (
          <TarjetaProducto
            key={p.id}
            producto={p}
            onAgregarAlCarrito={() => mostrarToast('Producto agregado al carrito', 'exito')}
          />
        ))}
      </div>
    </section>
  )
}

/* ─── Separador visual mobile ─── */
function SeparadorMobile() {
  return <div className="mx-4 mb-7 h-px bg-marca-beige-borde/60 lg:hidden" />
}

/* ─── Página principal ─── */
export default function Inicio() {
  const categorias = useCategorias(s => s.getActivas())
  const productos = useProductos(s => s.getProductosActivos())
  const destacados = useProductos(s => s.getDestacados())
  const masVendidos = useProductos(s => s.getMasVendidos())

  const nuevos = [...productos].sort((a, b) => new Date(b.creadoEn) - new Date(a.creadoEn))
  const accesorios = productos.filter(p => {
    const catIds = categorias
      .filter(c => ['Accesorios', 'Collares', 'Pulseras', 'Aretes', 'Anillos'].includes(c.nombre))
      .map(c => c.id)
    return catIds.includes(p.categoriaId)
  })

  return (
    <div className="animate-fade-in">

      {/* Banner principal */}
      <div className="contenedor pt-4 mb-5 lg:pt-6 lg:mb-8">
        <CarruselBanners />
      </div>

      {/* Chips de categorías (solo mobile) */}
      {categorias.length > 0 && <CategoriasChips categorias={categorias} />}

      {/* Grid de categorías (solo desktop) */}
      {categorias.length > 0 && <CategoriasGrid categorias={categorias} />}

      {/* Secciones de productos */}
      {destacados.length > 0 && (
        <>
          <SeccionProductos titulo="Destacados" productos={destacados} enlace="/categorias" />
          <SeparadorMobile />
        </>
      )}

      {masVendidos.length > 0 && (
        <>
          <SeccionProductos titulo="Más vendidos" productos={masVendidos} enlace="/categorias" />
          <SeparadorMobile />
        </>
      )}

      {nuevos.length > 0 && (
        <>
          <SeccionProductos titulo="Nuevos accesorios" productos={nuevos} enlace="/categorias" />
          <SeparadorMobile />
        </>
      )}

      {accesorios.length > 0 && (
        <SeccionProductos titulo="Accesorios" productos={accesorios} enlace="/categorias" />
      )}

      {/* Estado vacío */}
      {!productos.length && (
        <div className="contenedor py-16 text-center">
          <p className="text-4xl mb-4">✨</p>
          <p className="font-semibold text-marca-negro">¡Próximamente!</p>
          <p className="text-sm text-marca-texto-suave mt-1">Los productos estarán disponibles muy pronto.</p>
        </div>
      )}
    </div>
  )
}
