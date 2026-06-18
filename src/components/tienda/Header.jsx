import { Search, ShoppingBag, Heart, Home, Grid3x3, User } from 'lucide-react'
import { useNavigate, Link, NavLink } from 'react-router-dom'
import { useCarrito } from '../../store/useCarrito'
import { useFavoritos } from '../../store/useFavoritos'
import { useConfig } from '../../store/useConfig'
import { useState } from 'react'

export function Header() {
  const navigate = useNavigate()
  const totalItems = useCarrito(s => s.getTotalItems())
  const favoritos = useFavoritos(s => s.favoritos)
  const config = useConfig(s => s.config)
  const [busqueda, setBusqueda] = useState('')

  const manejarBusqueda = (e) => {
    e.preventDefault()
    if (busqueda.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(busqueda.trim())}`)
      setBusqueda('')
    }
  }

  const navLinks = [
    { to: '/', label: 'Inicio', end: true },
    { to: '/categorias', label: 'Categorías' },
    { to: '/favoritos', label: 'Favoritos' },
    { to: '/sobre', label: 'Nosotros' },
  ]

  return (
    <header className="bg-white border-b border-marca-beige-borde sticky top-0 z-40 safe-area-top">
      {/* Mobile layout */}
      <div className="contenedor py-3 lg:hidden">
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

      {/* Desktop layout */}
      <div className="contenedor hidden lg:flex items-center gap-6 py-3.5">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          {config.logo ? (
            <img src={config.logo} alt={config.nombre} className="h-10 w-auto object-contain" />
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-marca-marron rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm font-display">YF</span>
              </div>
              <span className="font-display font-bold text-marca-negro text-2xl tracking-tight">
                Yeral <span className="text-marca-marron">fancy</span>
              </span>
            </div>
          )}
        </Link>

        <form onSubmit={manejarBusqueda} className="flex-1 max-w-xl">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-marca-texto-suave" />
            <input
              type="search"
              placeholder="Buscar accesorios, collares, aretes..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full bg-marca-beige rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder-marca-texto-suave border border-transparent focus:border-marca-marron focus:bg-white transition-all"
            />
          </div>
        </form>

        <nav className="flex items-center gap-1">
          {navLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150
                 ${isActive
                   ? 'bg-marca-beige text-marca-marron-oscuro'
                   : 'text-marca-texto-suave hover:text-marca-negro hover:bg-marca-beige/60'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <Link to="/carrito" className="relative flex items-center gap-2 bg-marca-negro text-white px-4 py-2.5 rounded-xl hover:bg-marca-marron-oscuro transition-all duration-150 shrink-0">
          <ShoppingBag size={18} strokeWidth={2} />
          <span className="text-sm font-semibold">Carrito</span>
          {totalItems > 0 && (
            <span className="w-5 h-5 bg-marca-marron text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce-in">
              {totalItems > 9 ? '9+' : totalItems}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}
