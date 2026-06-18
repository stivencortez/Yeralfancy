import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/useAuth'
import {
  LayoutDashboard, Package, Tag, Warehouse, ShoppingCart,
  Image, Users, BarChart2, Settings, LogOut, X, Globe
} from 'lucide-react'

const enlaces = [
  { a: '/admin', icono: LayoutDashboard, etiqueta: 'Dashboard', exacto: true },
  { a: '/admin/pedidos', icono: ShoppingCart, etiqueta: 'Pedidos' },
  { a: '/admin/productos', icono: Package, etiqueta: 'Productos' },
  { a: '/admin/categorias', icono: Tag, etiqueta: 'Categorías' },
  { a: '/admin/inventario', icono: Warehouse, etiqueta: 'Inventario' },
  { a: '/admin/banners', icono: Image, etiqueta: 'Banners' },
  { a: '/admin/clientes', icono: Users, etiqueta: 'Clientes' },
  { a: '/admin/metricas', icono: BarChart2, etiqueta: 'Métricas' },
  { a: '/admin/configuracion', icono: Settings, etiqueta: 'Configuración' },
]

export function Sidebar({ abierto, onCerrar }) {
  const cerrarSesion = useAuth(s => s.cerrarSesion)
  const navigate = useNavigate()

  const handleCerrarSesion = () => {
    cerrarSesion()
    navigate('/admin/login')
  }

  return (
    <>
      {abierto && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onCerrar} />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-marca-beige-borde z-50 flex flex-col
          transition-transform duration-300 lg:static lg:translate-x-0 lg:z-auto
          ${abierto ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-5 flex items-center justify-between border-b border-marca-beige-borde">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-marca-marron rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm font-display">YF</span>
            </div>
            <div>
              <p className="font-display font-bold text-marca-negro text-base leading-none">Yeral fancy</p>
              <p className="text-[10px] text-marca-texto-suave">Administración</p>
            </div>
          </div>
          <button onClick={onCerrar} className="lg:hidden p-1.5 rounded-lg hover:bg-marca-beige">
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {enlaces.map(({ a, icono: Icono, etiqueta, exacto }) => (
            <NavLink
              key={a}
              to={a}
              end={exacto}
              onClick={onCerrar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-medium transition-all
                 ${isActive
                   ? 'bg-marca-beige text-marca-marron-oscuro'
                   : 'text-marca-texto-suave hover:bg-marca-beige/50 hover:text-marca-negro'
                 }`
              }
            >
              <Icono size={18} strokeWidth={1.8} />
              {etiqueta}
            </NavLink>
          ))}

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm font-medium text-marca-texto-suave hover:bg-marca-beige/50 hover:text-marca-negro transition-all"
          >
            <Globe size={18} strokeWidth={1.8} />
            Ver tienda
          </a>
        </nav>

        <div className="p-3 border-t border-marca-beige-borde">
          <button
            onClick={handleCerrarSesion}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={18} strokeWidth={1.8} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
