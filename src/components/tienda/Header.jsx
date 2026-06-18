import { Search, ShoppingBag, Menu } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { useCarrito } from '../../store/useCarrito'
import { useConfig } from '../../store/useConfig'
import { useState } from 'react'

export function Header() {
  const navigate = useNavigate()
  const totalItems = useCarrito(s => s.getTotalItems())
  const config = useConfig(s => s.config)
  const [busqueda, setBusqueda] = useState('')

  const manejarBusqueda = (e) => {
    e.preventDefault()
    if (busqueda.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(busqueda.trim())}`)
      setBusqueda('')
    }
  }

  return (
    <header className="bg-white border-b border-marca-beige-borde sticky top-0 z-40 safe-area-top">
      <div className="contenedor py-3">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex-1 flex items-center gap-2 min-w-0">
            {config.logo ? (
              <img src={config.logo} alt={config.nombre} className="h-9 w-auto object-contain" />
            ) : (
              <div className="flex items-center gap-1">
                <div className="w-8 h-8 bg-marca-marron rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm font-display">YF</span>
                </div>
                <span className="font-display font-bold text-marca-negro text-xl tracking-tight">
                  Yeral <span className="text-marca-marron">fancy</span>
                </span>
              </div>
            )}
          </Link>

          <Link to="/carrito" className="relative p-2">
            <ShoppingBag size={22} className="text-marca-negro" strokeWidth={1.8} />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-marca-marron text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce-in">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Link>
        </div>

        <form onSubmit={manejarBusqueda} className="mt-2.5">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-marca-texto-suave" />
            <input
              type="search"
              placeholder="Buscar accesorios, collares, aretes..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full bg-marca-beige rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder-marca-texto-suave border border-transparent focus:border-marca-marron focus:bg-white transition-all"
            />
          </div>
        </form>
      </div>
    </header>
  )
}
