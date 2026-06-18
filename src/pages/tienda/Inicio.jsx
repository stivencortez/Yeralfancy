import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { CarruselBanners } from '../../components/tienda/CarruselBanners'
import { TarjetaProducto } from '../../components/tienda/TarjetaProducto'
import { useTiendaToast } from '../../layouts/LayoutTienda'
import { useProductos } from '../../store/useProductos'
import { useCategorias } from '../../store/useCategorias'

function SeccionProductos({ titulo, productos, enlace }) {
  const mostrarToast = useTiendaToast()
  if (!productos.length) return null
  return (
    <section className="mb-6">
      <div className="contenedor flex items-center justify-between mb-3">
        <h2 className="font-bold text-marca-negro text-base">{titulo}</h2>
        {enlace && (
          <Link to={enlace} className="flex items-center gap-0.5 text-xs text-marca-marron font-medium">
            Ver todo <ChevronRight size={14} />
          </Link>
        )}
      </div>
      <div className="contenedor grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {productos.slice(0, 4).map(p => (
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

function CategoriasDestacadas({ categorias }) {
  const coloresBg = [
    'bg-rose-50', 'bg-amber-50', 'bg-emerald-50', 'bg-sky-50',
    'bg-violet-50', 'bg-pink-50', 'bg-teal-50', 'bg-orange-50',
  ]
  return (
    <section className="mb-6">
      <div className="contenedor mb-3">
        <h2 className="font-bold text-marca-negro text-base">Categorías</h2>
      </div>
      <div className="scroll-horizontal px-4">
        {categorias.map((cat, i) => (
          <Link
            key={cat.id}
            to={`/categorias/${cat.id}`}
            className="flex flex-col items-center gap-2 shrink-0"
          >
            <div className={`w-16 h-16 rounded-2xl overflow-hidden ${coloresBg[i % coloresBg.length]}`}>
              {cat.imagen ? (
                <img src={cat.imagen} alt={cat.nombre} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">💎</div>
              )}
            </div>
            <span className="text-xs text-marca-texto font-medium text-center w-16 truncate">{cat.nombre}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default function Inicio() {
  const categorias = useCategorias(s => s.getActivas())
  const productos = useProductos(s => s.getProductosActivos())
  const destacados = useProductos(s => s.getDestacados())
  const masVendidos = useProductos(s => s.getMasVendidos())

  const nuevos = [...productos].sort((a, b) => new Date(b.creadoEn) - new Date(a.creadoEn))
  const accesorios = productos.filter(p => {
    const catIds = categorias.filter(c => ['Accesorios', 'Collares', 'Pulseras', 'Aretes', 'Anillos'].includes(c.nombre)).map(c => c.id)
    return catIds.includes(p.categoriaId)
  })

  return (
    <div className="animate-fade-in">
      <div className="contenedor pt-4 mb-4">
        <CarruselBanners />
      </div>

      <CategoriasDestacadas categorias={categorias} />

      <SeccionProductos titulo="Destacados" productos={destacados} enlace="/categorias" />
      <SeccionProductos titulo="Más vendidos" productos={masVendidos} enlace="/categorias" />
      <SeccionProductos titulo="Nuevos" productos={nuevos} enlace="/categorias" />
      <SeccionProductos titulo="Accesorios" productos={accesorios} enlace="/categorias" />

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
