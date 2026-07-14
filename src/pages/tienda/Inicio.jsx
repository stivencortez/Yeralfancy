import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { CarruselBanners } from '../../components/tienda/CarruselBanners'
import { TarjetaProducto } from '../../components/tienda/TarjetaProducto'
import { useTiendaToast } from '../../layouts/LayoutTienda'
import { useProductos } from '../../store/useProductos'
import { useCategorias } from '../../store/useCategorias'

/* ─── Chips de categorías (mobile) — entre secciones de productos ─── */
function CategoriasChips({ categorias }) {
  return (
    <div className="mb-6 lg:hidden">
      <div className="flex gap-2 overflow-x-auto pb-1 px-4" style={{ scrollbarWidth: 'none' }}>
        <Link
          to="/categorias"
          className="shrink-0 px-5 py-2 rounded-full text-sm font-bold bg-marca-negro text-white whitespace-nowrap active:scale-95 transition-transform"
        >
          Ver todo
        </Link>
        {categorias.map((cat) => (
          <Link
            key={cat.id}
            to={`/categorias/${cat.id}`}
            className="shrink-0 px-4 py-2 rounded-full text-sm font-medium bg-white text-marca-texto border border-marca-beige-borde hover:border-marca-marron hover:text-marca-negro transition-all duration-200 active:scale-95 whitespace-nowrap"
          >
            {cat.nombre}
          </Link>
        ))}
      </div>
    </div>
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
function SeccionProductos({ titulo, productos, enlace, limite = 4 }) {
  const mostrarToast = useTiendaToast()
  if (!productos.length) return null

  return (
    <section className="mb-7">
      {/* Encabezado */}
      <div className="contenedor flex items-center justify-between mb-3">
        <h2 className="font-bold text-marca-negro text-[1.05rem] lg:text-lg">{titulo}</h2>
        {enlace && (
          <Link
            to={enlace}
            className="flex items-center gap-0.5 text-xs text-marca-marron font-semibold hover:text-marca-marron-oscuro transition-colors"
          >
            Ver todo <ChevronRight size={13} />
          </Link>
        )}
      </div>

      {/* Mobile: grid 2 columnas — igual que la referencia */}
      <div className="contenedor grid grid-cols-2 gap-3 lg:hidden">
        {productos.slice(0, limite).map(p => (
          <TarjetaProducto
            key={p.id}
            producto={p}
            onAgregarAlCarrito={() => mostrarToast('Producto agregado al carrito', 'exito')}
          />
        ))}
      </div>

      {/* Desktop: grid más amplio */}
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

/* ─── Página principal ─── */
export default function Inicio() {
  const categorias = useCategorias(s => s.getActivas())
  const productos = useProductos(s => s.getProductosActivos())
  const destacados = useProductos(s => s.getDestacados())
  const masVendidos = useProductos(s => s.getMasVendidos())

  const nuevos = [...productos].sort((a, b) => new Date(b.creadoEn) - new Date(a.creadoEn))

  /* Primera sección: destacados o nuevos como fallback */
  const primeraSeccion = destacados.length ? destacados : nuevos

  return (
    <div className="animate-fade-in">

      {/* Banner principal */}
      <div className="contenedor pt-4 mb-6 lg:pt-6 lg:mb-8">
        <CarruselBanners />
      </div>

      {/* ── CHIPS DE CATEGORÍAS debajo del banner (solo mobile) ── */}
      {categorias.length > 0 && <CategoriasChips categorias={categorias} />}

      {/* Grid de categorías — solo desktop */}
      {categorias.length > 0 && <CategoriasGrid categorias={categorias} />}

      {/* Primera sección de productos */}
      {primeraSeccion.length > 0 && (
        <SeccionProductos
          titulo="Productos populares"
          productos={primeraSeccion}
          enlace="/categorias"
          limite={4}
        />
      )}

      {/* Segunda sección de productos */}
      {masVendidos.length > 0 && (
        <SeccionProductos
          titulo="Más vendidos"
          productos={masVendidos}
          enlace="/categorias"
          limite={4}
        />
      )}

      {/* Tercera sección — nuevos (si hay contenido distinto) */}
      {nuevos.length > 0 && nuevos !== primeraSeccion && (
        <SeccionProductos
          titulo="Nuevos accesorios"
          productos={nuevos}
          enlace="/categorias"
          limite={4}
        />
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
