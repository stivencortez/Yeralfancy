import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../store/useAuth'
import { useConfig } from '../store/useConfig'
import { Sidebar } from '../components/admin/Sidebar'
import { ToastContenedor } from '../components/ui/Toast'
import { useToast } from '../hooks/useToast'
import { createContext, useContext, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

const AdminToastCtx      = createContext(null)
const AdminModoOscuroCtx = createContext(null)

export const useAdminToast      = () => useContext(AdminToastCtx)
export const useAdminModoOscuro = () => useContext(AdminModoOscuroCtx)

function cargarBool(key, def = false) {
  try { return localStorage.getItem(key) === 'true' } catch { return def }
}

export function LayoutAdmin() {
  const autenticado = useAuth(s => s.autenticado)
  const config      = useConfig(s => s.config)
  const { toasts, agregar, quitar } = useToast()

  const [sidebarAbierto, setSidebarAbierto] = useState(false)
  const [modoOscuro,     setModoOscuro]     = useState(() => cargarBool('admin-modo-oscuro'))
  const [expandido,      setExpandido]      = useState(() => cargarBool('admin-sidebar-expandida', true))

  const toggleModoOscuro = () => {
    setModoOscuro(prev => {
      const v = !prev
      try { localStorage.setItem('admin-modo-oscuro', String(v)) } catch {}
      return v
    })
  }

  const toggleExpandido = () => {
    setExpandido(prev => {
      const v = !prev
      try { localStorage.setItem('admin-sidebar-expandida', String(v)) } catch {}
      return v
    })
  }

  if (!autenticado) return <Navigate to="/admin/login" replace />

  const logoActual = modoOscuro && config.logoDark ? config.logoDark : config.logo

  return (
    <AdminToastCtx.Provider value={agregar}>
      <AdminModoOscuroCtx.Provider value={{ modoOscuro, toggleModoOscuro }}>
        {/*
          ⚠ Bug fix: o root wrapper tem a classe `dark` nele mesmo.
          O seletor CSS `.dark .bg-marca-beige-suave` usa descendant combinator,
          portanto NÃO aplica ao próprio elemento .dark. Fundo ficava branco.
          Solução: condicional explícito no JSX para o bg do root.
        */}
        <div className={`min-h-screen flex transition-colors duration-300 ${modoOscuro ? 'dark bg-[#181512]' : 'bg-marca-beige-suave'}`}>

          <Sidebar
            abierto={sidebarAbierto}
            onCerrar={() => setSidebarAbierto(false)}
            modoOscuro={modoOscuro}
            toggleModoOscuro={toggleModoOscuro}
            expandido={expandido}
            onToggleExpandido={toggleExpandido}
          />

          <div className="flex-1 flex flex-col min-w-0">

            {/* ── Header ── */}
            {/*
              Não usamos bg-white em dark pois `.dark .bg-white` tem especificidade
              maior que `.dark header` e sobreescreveria com cor de card.
              Sem a classe bg-white, o CSS `.dark header { bg: dk-surface }` aplica corretamente.
            */}
            <header className={`sticky top-0 z-30 h-[60px] flex items-center border-b transition-colors duration-300
              ${modoOscuro ? '' : 'bg-white border-marca-beige-borde'}`}>

              {/* Botón menú mobile */}
              <button
                onClick={() => setSidebarAbierto(true)}
                className={`lg:hidden flex items-center justify-center w-[60px] h-[60px] shrink-0 transition-colors
                  ${modoOscuro ? 'hover:bg-[#312920]' : 'hover:bg-marca-beige'}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="3" y1="6"  x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>

              {/* Logo mobile */}
              <div className="lg:hidden flex-1 flex items-center px-3">
                {logoActual ? (
                  <img src={logoActual} alt={config.nombre} className="h-8 w-auto max-w-[120px] object-contain" />
                ) : (
                  <span className="font-display font-bold text-marca-negro text-sm">{config.nombre}</span>
                )}
              </div>

              {/* Zona central desktop */}
              <div className="hidden lg:flex flex-1 items-center px-6">
                <span className="text-xs text-marca-texto-suave font-medium select-none">
                  {config.nombre}
                </span>
              </div>

              {/* Toggle tema — solo mobile (en desktop está en sidebar) */}
              <div className="flex items-center px-4 lg:hidden">
                <button
                  onClick={toggleModoOscuro}
                  title={modoOscuro ? 'Modo claro' : 'Modo oscuro'}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors
                    ${modoOscuro
                      ? 'text-marca-texto-suave hover:bg-[#312920] hover:text-marca-negro'
                      : 'text-marca-texto-suave hover:bg-marca-beige hover:text-marca-negro'}`}
                >
                  {modoOscuro
                    ? <Sun  size={17} strokeWidth={1.8} />
                    : <Moon size={17} strokeWidth={1.8} />
                  }
                </button>
              </div>
            </header>

            <main className="flex-1 p-4 lg:p-6 overflow-auto">
              <Outlet />
            </main>
          </div>

          <ToastContenedor toasts={toasts} quitar={quitar} />
        </div>
      </AdminModoOscuroCtx.Provider>
    </AdminToastCtx.Provider>
  )
}
