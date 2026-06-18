import { Search, ShoppingBag } from 'lucide-react'
import { useNavigate, Link, NavLink } from 'react-router-dom'
import { useCarrito } from '../../store/useCarrito'
import { useFavoritos } from '../../store/useFavoritos'
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

  const navLinks = [
    { to: '/', label: 'Inicio', end: true },
    { to: '/categorias', label: 'Categorías' },
    { to: '/favoritos', label: 'Favoritos' },
    { to: '/sobre', label: 'Nosotros' },
  ]

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-marca-beige-borde/60 sticky top-0 z-40 safe-area-top">

      {/* ── Mobile: solo logo + lupa + carrito ── */}
      <div className="px-5 py-3.5 lg:hidden">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex-1 flex items-center min-w-0">
            <img
              src={config.logo || '/logos/IMG_5723.PNG'}
              alt={config.nombre}
              className="h-9 w-auto object-contain"
            />
          </Link>
          <Link
            to="/buscar"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-marca-beige transition-colors"
          >
            <Search size={20} className="text-marca-negro" strokeWidth={1.8} />
          </Link>
          <Link to="/carrito" className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-marca-beige transition-colors">
            <ShoppingBag size={20} className="text-marca-negro" strokeWidth={1.8} />
            {totalItems > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-marca-negro text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce-in">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* ── Desktop: header completo ── */}
      <div className="contenedor hidden lg:flex items-center gap-6 py-3.5">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img
            src={config.logo || '/logos/IMG_5723.PNG'}
            alt={config.nombre}
            className="h-10 w-auto object-contain"
          />
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
