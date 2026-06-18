import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { TarjetaProducto } from '../../components/tienda/TarjetaProducto'
import { useTiendaToast } from '../../layouts/LayoutTienda'
import { useProductos } from '../../store/useProductos'
import { EstadoVacio } from '../../components/ui/Cargando'
import { useState } from 'react'

export default function Buscar() {
  const [params] = useSearchParams()
  const q = params.get('q') || ''
  const navigate = useNavigate()
  const mostrarToast = useTiendaToast()
  const productos = useProductos(s => s.getProductosActivos())
  const [input, setInput] = useState(q)

  const manejarBusqueda = (e) => {
    e.preventDefault()
    const texto = input.trim()
    if (texto) navigate(`/buscar?q=${encodeURIComponent(texto)}`)
  }

  const resultados = q
    ? productos.filter(p =>
        p.nombre.toLowerCase().includes(q.toLowerCase()) ||
        p.descripcion?.toLowerCase().includes(q.toLowerCase())
      )
    : []

  return (
    <div className="contenedor py-5 animate-fade-in">
      {/* Campo de búsqueda visible en mobile */}
      <form onSubmit={manejarBusqueda} className="mb-5 lg:hidden">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-marca-texto-suave" />
          <input
            type="search"
            autoFocus
            placeholder="Buscar accesorios, collares, aretes..."
            value={input}
            onChange={e => setInput(e.target.value)}
            className="w-full bg-marca-beige rounded-xl pl-10 pr-4 py-3 text-sm placeholder-marca-texto-suave border border-transparent focus:border-marca-marron focus:bg-white transition-all"
          />
        </div>
      </form>

      {q && (
        <p className="text-sm text-marca-texto-suave mb-5">
          {resultados.length} resultado{resultados.length !== 1 ? 's' : ''} para <span className="font-semibold text-marca-negro">"{q}"</span>
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
