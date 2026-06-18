import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { TarjetaProducto } from '../../components/tienda/TarjetaProducto'
import { useTiendaToast } from '../../layouts/LayoutTienda'
import { useCategorias } from '../../store/useCategorias'
import { useProductos } from '../../store/useProductos'
import { EstadoVacio } from '../../components/ui/Cargando'

export default function CategoriaDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const mostrarToast = useTiendaToast()
  const categoria = useCategorias(s => s.getCategoria(id))
  const productos = useProductos(s => s.getPorCategoria(id))

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
      <div className="relative">
        {categoria.imagen && (
          <div className="w-full h-32 overflow-hidden bg-marca-beige">
            <img src={categoria.imagen} alt={categoria.nombre} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
          </div>
        )}
        <div className="contenedor py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-marca-beige transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-bold text-xl text-marca-negro">{categoria.nombre}</h1>
            <p className="text-xs text-marca-texto-suave">{productos.length} productos</p>
          </div>
        </div>
      </div>

      <div className="contenedor pb-6">
        {productos.length > 0 ? (
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
