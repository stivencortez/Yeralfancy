import { Home, Grid3x3, ShoppingBag, Heart, User } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { useCarrito } from '../../store/useCarrito'
import { useFavoritos } from '../../store/useFavoritos'

export function BarraInferior() {
  const totalItems = useCarrito(s => s.getTotalItems())
  const favoritos = useFavoritos(s => s.favoritos)

  const items = [
    { a: '/', icono: Home, etiqueta: 'Inicio', exacto: true },
    { a: '/categorias', icono: Grid3x3, etiqueta: 'Categorías' },
    { a: '/carrito', icono: ShoppingBag, etiqueta: 'Carrito', badge: totalItems },
    { a: '/favoritos', icono: Heart, etiqueta: 'Favoritos', badge: favoritos.length },
    { a: '/sobre', icono: User, etiqueta: 'Más' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-marca-beige-borde shadow-barra z-40 safe-area-bottom lg:hidden">
      <div className="flex items-center justify-around px-2 py-1">
        {items.map(({ a, icono: Icono, etiqueta, badge, exacto }) => (
          <NavLink
            key={a}
            to={a}
            end={exacto}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 min-w-0 relative
               ${isActive ? 'text-marca-marron' : 'text-marca-texto-suave'}`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`relative transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                  <Icono
                    size={22}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    fill={isActive ? 'currentColor' : 'none'}
                  />
                  {badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-marca-marron text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-medium transition-all ${isActive ? 'text-marca-marron' : 'text-marca-texto-suave'}`}>
                  {etiqueta}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
