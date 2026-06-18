import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/useAuth'
import { useConfig } from '../../store/useConfig'
import {
  LayoutDashboard, Package, Tag, Warehouse, ShoppingCart,
  Image, Users, BarChart2, Settings, LogOut, X, Globe
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const GRUPOS = [
  {
    titulo: 'Principal',
    items: [
      { a: '/admin', icono: LayoutDashboard, etiqueta: 'Dashboard', exacto: true },
      { a: '/admin/pedidos', icono: ShoppingCart, etiqueta: 'Pedidos' },
    ],
  },
  {
    titulo: 'Catálogo',
    items: [
      { a: '/admin/productos', icono: Package, etiqueta: 'Productos' },
      { a: '/admin/categorias', icono: Tag, etiqueta: 'Categorías' },
      { a: '/admin/inventario', icono: Warehouse, etiqueta: 'Inventario' },
      { a: '/admin/banners', icono: Image, etiqueta: 'Banners' },
    ],
  },
  {
    titulo: 'Análisis',
    items: [
      { a: '/admin/clientes', icono: Users, etiqueta: 'Clientes' },
      { a: '/admin/metricas', icono: BarChart2, etiqueta: 'Métricas' },
    ],
  },
  {
    titulo: 'Sistema',
    items: [
      { a: '/admin/configuracion', icono: Settings, etiqueta: 'Configuración' },
    ],
  },
]

function NavItem({ a, icono: Icono, etiqueta, exacto, onCerrar }) {
  return (
    <NavLink
      to={a}
      end={exacto}
      onClick={onCerrar}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden
         ${isActive
           ? 'bg-marca-marron/10 text-marca-marron-oscuro'
           : 'text-marca-texto-suave hover:bg-marca-beige/70 hover:text-marca-negro'
         }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="activeIndicator"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-marca-marron rounded-r-full"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <Icono
            size={17}
            strokeWidth={isActive ? 2.2 : 1.8}
            className={`shrink-0 transition-colors duration-200 ${isActive ? 'text-marca-marron' : ''}`}
          />
          <span>{etiqueta}</span>
        </>
      )}
    </NavLink>
  )
}

export function Sidebar({ abierto, onCerrar }) {
  const cerrarSesion = useAuth(s => s.cerrarSesion)
  const navigate = useNavigate()
  const config = useConfig(s => s.config)

  const handleCerrarSesion = () => {
    cerrarSesion()
    navigate('/admin/login')
  }

  return (
    <>
      <AnimatePresence>
        {abierto && (
          <motion.div
            key="overlay"
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onCerrar}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-marca-beige-borde z-50 flex flex-col
          transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:z-auto
          ${abierto ? 'translate-x-0 shadow-modal' : '-translate-x-full'}`}
      >
        {/* Logo header */}
        <div className="p-4 border-b border-marca-beige-borde">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {config.logo ? (
                <img
                  src={config.logo}
                  alt={config.nombre}
                  className="h-10 w-auto max-w-[140px] object-contain"
                />
              ) : (
                <>
                  <div className="w-9 h-9 bg-gradient-to-br from-marca-marron to-marca-marron-oscuro rounded-xl flex items-center justify-center shrink-0 shadow-tarjeta">
                    <span className="text-white font-bold text-sm font-display">YF</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-bold text-marca-negro text-sm leading-none truncate">{config.nombre}</p>
                    <p className="text-[10px] text-marca-texto-suave mt-0.5">Administración</p>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={onCerrar}
              className="lg:hidden p-1.5 rounded-lg hover:bg-marca-beige transition-colors shrink-0"
            >
              <X size={15} />
            </button>
          </div>
          {config.logo && (
            <p className="text-[10px] text-marca-texto-suave mt-2.5 font-medium uppercase tracking-wide">Panel de administración</p>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
          {GRUPOS.map(grupo => (
            <div key={grupo.titulo}>
              <p className="text-[9px] font-bold uppercase tracking-widest text-marca-texto-suave/50 px-3 mb-1">
                {grupo.titulo}
              </p>
              <div className="space-y-0.5">
                {grupo.items.map(item => (
                  <NavItem key={item.a} {...item} onCerrar={onCerrar} />
                ))}
              </div>
            </div>
          ))}

          {/* Accesos */}
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-marca-texto-suave/50 px-3 mb-1">
              Accesos
            </p>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-marca-texto-suave hover:bg-marca-beige/70 hover:text-marca-negro transition-all duration-200"
            >
              <Globe size={17} strokeWidth={1.8} />
              Ver tienda
            </a>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-marca-beige-borde">
          <button
            onClick={handleCerrarSesion}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-sm font-medium text-red-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <LogOut size={17} strokeWidth={1.8} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
