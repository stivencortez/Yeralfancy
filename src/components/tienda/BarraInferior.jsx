import { Home, Search, ShoppingBag, Heart, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useCarrito } from '../../store/useCarrito'
import { useFavoritos } from '../../store/useFavoritos'

export function BarraInferior() {
  const totalItems = useCarrito(s => s.getTotalItems())
  const favoritos = useFavoritos(s => s.favoritos)

  const items = [
    { a: '/', icono: Home, etiqueta: 'Inicio', exacto: true },
    { a: '/buscar', icono: Search, etiqueta: 'Buscar' },
    { a: '/carrito', icono: ShoppingBag, etiqueta: 'Carrito', badge: totalItems },
    { a: '/favoritos', icono: Heart, etiqueta: 'Favoritos', badge: favoritos.length },
    { a: '/sobre', icono: User, etiqueta: 'Más' },
  ]

  return (
    <nav
      className="fixed left-3 right-3 z-40 lg:hidden"
      style={{ bottom: 'max(1rem, calc(env(safe-area-inset-bottom, 0px) + 0.5rem))' }}
    >
      <div
        className="bg-white/96 backdrop-blur-xl rounded-[26px] border border-marca-beige-borde/50"
        style={{ boxShadow: '0 8px 32px rgba(28,28,28,0.13), 0 2px 8px rgba(28,28,28,0.06)' }}
      >
        <div className="flex items-center justify-around px-1 py-2">
          {items.map(({ a, icono: Icono, etiqueta, badge, exacto }) => (
            <NavLink
              key={a}
              to={a}
              end={exacto}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all duration-200 min-w-[56px] relative select-none
                 ${isActive ? 'text-marca-negro' : 'text-[#B0A090]'}`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    {isActive && (
                      <span className="absolute -inset-x-2 -inset-y-1.5 bg-marca-beige rounded-xl transition-all duration-200" />
                    )}
                    <Icono
                      size={22}
                      strokeWidth={isActive ? 2.2 : 1.6}
                      className="relative z-10 transition-all duration-200"
                    />
                    {badge > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-marca-negro text-white text-[9px] font-bold rounded-full flex items-center justify-center px-[3px] z-20 animate-bounce-in">
                        {badge > 9 ? '9+' : badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] relative z-10 transition-all duration-200 ${isActive ? 'font-semibold text-marca-negro' : 'font-medium'}`}>
                    {etiqueta}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
