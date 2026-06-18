import { useSearchParams, Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { TarjetaProducto } from '../../components/tienda/TarjetaProducto'
import { useTiendaToast } from '../../layouts/LayoutTienda'
import { useProductos } from '../../store/useProductos'
import { EstadoVacio } from '../../components/ui/Cargando'

export default function Buscar() {
  const [params] = useSearchParams()
  const q = params.get('q') || ''
  const mostrarToast = useTiendaToast()
  const productos = useProductos(s => s.getProductosActivos())

  const resultados = q
    ? productos.filter(p =>
        p.nombre.toLowerCase().includes(q.toLowerCase()) ||
        p.descripcion?.toLowerCase().includes(q.toLowerCase())
      )
    : []

  return (
    <div className="contenedor py-5 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <Search size={18} className="text-marca-texto-suave" />
        <h1 className="font-bold text-xl text-marca-negro">
          {q ? `"${q}"` : 'Búsqueda'}
        </h1>
      </div>
      {q && (
        <p className="text-sm text-marca-texto-suave mb-5">
          {resultados.length} resultado{resultados.length !== 1 ? 's' : ''}
        </p>
      )}

      {!q ? (
        <EstadoVacio icono="🔍" titulo="Escribe para buscar" descripcion="Usa la barra de búsqueda para encontrar productos." />
      ) : resultados.length === 0 ? (
        <EstadoVacio
          icono="😔"
          titulo="Sin resultados"
          descripcion={`No encontramos productos para "${q}".`}
          accion={<Link to="/categorias" className="btn-primario mt-4 inline-flex">Ver categorías</Link>}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {resultados.map(p => (
            <TarjetaProducto
              key={p.id}
              producto={p}
              onAgregarAlCarrito={() => mostrarToast('Producto agregado al carrito', 'exito')}
            />
          ))}
        </div>
      )}
    </div>
  )
}
