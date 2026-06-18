import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../store/useAuth'
import { useConfig } from '../store/useConfig'
import { Sidebar } from '../components/admin/Sidebar'
import { ToastContenedor } from '../components/ui/Toast'
import { useToast } from '../hooks/useToast'
import { createContext, useContext, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

const AdminToastCtx = createContext(null)
export const useAdminToast = () => useContext(AdminToastCtx)

const AdminModoOscuroCtx = createContext(null)
export const useAdminModoOscuro = () => useContext(AdminModoOscuroCtx)

function cargarModoOscuro() {
  try { return localStorage.getItem('admin-modo-oscuro') === 'true' } catch { return false }
}

export function LayoutAdmin() {
  const autenticado = useAuth(s => s.autenticado)
  const config = useConfig(s => s.config)
  const { toasts, agregar, quitar } = useToast()
  const [sidebarAbierto, setSidebarAbierto] = useState(false)
  const [modoOscuro, setModoOscuro] = useState(cargarModoOscuro)

  const toggleModoOscuro = () => {
    setModoOscuro(prev => {
      const nuevo = !prev
      try { localStorage.setItem('admin-modo-oscuro', String(nuevo)) } catch {}
      return nuevo
    })
  }

  if (!autenticado) return <Navigate to="/admin/login" replace />

  return (
    <AdminToastCtx.Provider value={agregar}>
      <AdminModoOscuroCtx.Provider value={{ modoOscuro, toggleModoOscuro }}>
        <div className={`min-h-screen bg-marca-beige-suave flex${modoOscuro ? ' dark' : ''}`}>
          <Sidebar abierto={sidebarAbierto} onCerrar={() => setSidebarAbierto(false)} />
          <div className="flex-1 flex flex-col min-w-0">
            <header className="bg-white border-b border-marca-beige-borde px-4 h-14 flex items-center gap-3 sticky top-0 z-30 shadow-[0_1px_8px_rgba(28,28,28,0.04)]">
              <button
                onClick={() => setSidebarAbierto(true)}
                className="lg:hidden p-2 rounded-xl hover:bg-marca-beige transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {config.logo ? (
                  <img
                    src={config.logo}
                    alt={config.nombre}
                    className="h-8 w-auto max-w-[120px] object-contain"
                  />
                ) : (
                  <div className="w-7 h-7 bg-gradient-to-br from-marca-marron to-marca-marron-oscuro rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-xs">YF</span>
                  </div>
                )}
                <div className="hidden sm:flex items-center gap-1.5">
                  <span className="font-semibold text-marca-negro text-sm">{config.nombre}</span>
                  <span className="text-marca-beige-borde text-xs">·</span>
                  <span className="text-xs text-marca-texto-suave">Panel Admin</span>
                </div>
              </div>
              <button
                onClick={toggleModoOscuro}
                title={modoOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                className="p-2 rounded-xl hover:bg-marca-beige transition-colors text-marca-texto-suave hover:text-marca-negro"
              >
                {modoOscuro ? <Sun size={17} /> : <Moon size={17} />}
              </button>
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
