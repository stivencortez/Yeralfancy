import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { TarjetaProducto } from '../../components/tienda/TarjetaProducto'
import { useTiendaToast } from '../../layouts/LayoutTienda'
import { useProductos } from '../../store/useProductos'
import { EstadoVacio } from '../../components/ui/Cargando'
import { useState, useEffect } from 'react'

export default function Buscar() {
  const [params] = useSearchParams()
  const q = params.get('q') || ''
  const navigate = useNavigate()
  const mostrarToast = useTiendaToast()
  const productos = useProductos(s => s.productos.filter(p => p.activo))
  const [input, setInput] = useState(q)

  // sincroniza o campo quando o q muda (navegação pelo histórico)
  useEffect(() => { setInput(q) }, [q])

  const manejarBusqueda = (e) => {
    e.preventDefault()
    const texto = input.trim()
    if (texto) navigate(`/buscar?q=${encodeURIComponent(texto)}`)
  }

  const termino = input.trim()
  const resultados = termino
    ? productos.filter(p =>
        p.nombre?.toLowerCase().includes(termino.toLowerCase()) ||
        p.descripcion?.toLowerCase().includes(termino.toLowerCase())
      )
    : productos

  return (
    <div className="contenedor py-5 animate-fade-in">
      {/* Campo de búsqueda visible en mobile */}
      <form onSubmit={manejarBusqueda} className="mb-5 lg:hidden">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-marca-texto-suave pointer-events-none" />
          <input
            type="search"
            autoFocus
            placeholder="Buscar accesorios, collares, aretes..."
            value={input}
            onChange={e => setInput(e.target.value)}
            className="w-full bg-marca-beige rounded-xl pl-10 pr-12 py-3 text-sm placeholder-marca-texto-suave border border-transparent focus:border-marca-marron focus:bg-white transition-all"
          />
          {input && (
            <button
              type="button"
              onClick={() => setInput('')}
              className="absolute right-10 top-1/2 -translate-y-1/2 text-marca-texto-suave hover:text-marca-negro"
            >
              <X size={14} />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-marca-negro text-white rounded-lg flex items-center justify-center"
          >
            <Search size={13} />
          </button>
        </div>
      </form>

      {termino ? (
        <p className="text-sm text-marca-texto-suave mb-4">
          {resultados.length} resultado{resultados.length !== 1 ? 's' : ''} para <span className="font-semibold text-marca-negro">"{termino}"</span>
        </p>
      ) : (
        <p className="text-sm text-marca-texto-suave mb-4">{productos.length} productos</p>
      )}

      {resultados.length === 0 ? (
        <EstadoVacio
          icono="😔"
          titulo="Sin resultados"
          descripcion={`No encontramos productos para "${termino}".`}
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
