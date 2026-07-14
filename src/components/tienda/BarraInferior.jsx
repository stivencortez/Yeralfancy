import { Home, Search, ShoppingBag, Heart, User } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
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
        className="bg-white rounded-[26px] border border-marca-beige-borde/50"
        style={{ boxShadow: '0 8px 28px rgba(28,28,28,0.18), 0 4px 12px rgba(28,28,28,0.09)' }}
      >
        <div className="flex items-center justify-around px-1 py-2">
          {items.map(({ a, icono: Icono, etiqueta, badge, exacto }) => (
            <NavLink
              key={a}
              to={a}
              end={exacto}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-2 min-w-[56px] relative select-none
                 ${isActive ? 'text-marca-negro' : 'text-[#B0A090]'}`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative flex items-center justify-center w-10 h-9">
                    {isActive && (
                      <motion.div
                        layoutId="barra-indicador"
                        className="absolute inset-0 bg-marca-negro rounded-xl"
                        transition={{
                          type: 'tween',
                          ease: [0.32, 0.0, 0.82, 1.0],
                          duration: 0.28,
                        }}
                      />
                    )}
                    <Icono
                      size={20}
                      strokeWidth={isActive ? 2.2 : 1.6}
                      className={`relative z-10 transition-colors duration-200 ${isActive ? 'text-white' : ''}`}
                    />
                    {badge > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-marca-marron text-white text-[9px] font-bold rounded-full flex items-center justify-center px-[3px] z-20 animate-bounce-in">
                        {badge > 9 ? '9+' : badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] transition-all duration-200 ${isActive ? 'font-semibold text-marca-negro' : 'font-medium'}`}>
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
