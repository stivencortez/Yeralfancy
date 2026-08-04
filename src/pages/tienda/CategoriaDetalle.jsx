import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { TarjetaProducto } from '../../components/tienda/TarjetaProducto'
import { useTiendaToast } from '../../layouts/LayoutTienda'
import { useCategorias } from '../../store/useCategorias'
import { useProductos } from '../../store/useProductos'
import { EstadoVacio } from '../../components/ui/Cargando'
import { useApp } from '../../store/useApp'

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2.5">
          <div className="aspect-[3/4] rounded-2xl bg-[#F0EDE8] animate-pulse" />
          <div className="flex flex-col px-1 gap-1.5">
            <div className="h-3 w-3/4 bg-[#F0EDE8] rounded-full animate-pulse" />
            <div className="h-2.5 w-1/2 bg-[#F0EDE8] rounded-full animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function CategoriaDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const mostrarToast = useTiendaToast()
  const isReady = useApp(s => s.isReady)
  const categoria = useCategorias(s => s.getCategoria(id))
  const productos = useProductos(s => s.getPorCategoria(id))

  // Mientras carga, si no encontramos la categoría, esperamos
  if (!isReady && !categoria) {
    return (
      <div className="animate-fade-in">
        <div className="contenedor py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-marca-beige transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col gap-1.5">
            <div className="h-5 w-40 bg-[#F0EDE8] rounded-full animate-pulse" />
            <div className="h-3 w-20 bg-[#F0EDE8] rounded-full animate-pulse" />
          </div>
        </div>
        <div className="contenedor pb-6">
          <SkeletonGrid />
        </div>
      </div>
    )
  }

  if (!categoria) {
    return (
      <div className="contenedor py-16 text-center">
        <p className="font-semibold text-marca-negro">Categoría no encontrada</p>
        <button onClick={() => navigate('/categorias')} className="btn-primario mt-4">Volver</button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="contenedor py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-marca-beige transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-bold text-xl text-marca-negro">{categoria.nombre}</h1>
          <p className="text-xs text-marca-texto-suave">{productos.length} productos</p>
        </div>
      </div>

      <div className="contenedor pb-6">
        {!isReady && !productos.length ? (
          <SkeletonGrid />
        ) : productos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {productos.map(p => (
              <TarjetaProducto
                key={p.id}
                producto={p}
                onAgregarAlCarrito={() => mostrarToast('Producto agregado al carrito', 'exito')}
              />
            ))}
          </div>
        ) : (
          <EstadoVacio
            icono="📦"
            titulo="Sin productos en esta categoría"
            descripcion="Próximamente agregaremos productos aquí."
          />
        )}
      </div>
    </div>
  )
}

