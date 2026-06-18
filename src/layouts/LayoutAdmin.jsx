import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../store/useAuth'
import { Sidebar } from '../components/admin/Sidebar'
import { ToastContenedor } from '../components/ui/Toast'
import { useToast } from '../hooks/useToast'
import { createContext, useContext, useState } from 'react'

const AdminToastCtx = createContext(null)
export const useAdminToast = () => useContext(AdminToastCtx)

export function LayoutAdmin() {
  const autenticado = useAuth(s => s.autenticado)
  const { toasts, agregar, quitar } = useToast()
  const [sidebarAbierto, setSidebarAbierto] = useState(false)

  if (!autenticado) return <Navigate to="/admin/login" replace />

  return (
    <AdminToastCtx.Provider value={agregar}>
      <div className="min-h-screen bg-marca-beige-suave flex">
        <Sidebar abierto={sidebarAbierto} onCerrar={() => setSidebarAbierto(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-white border-b border-marca-beige-borde px-4 h-14 flex items-center gap-3 sticky top-0 z-30">
            <button
              onClick={() => setSidebarAbierto(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-marca-beige transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-marca-marron rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">YF</span>
              </div>
              <span className="font-semibold text-marca-negro text-sm hidden sm:block">Panel Administrativo</span>
            </div>
          </header>
          <main className="flex-1 p-4 lg:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
        <ToastContenedor toasts={toasts} quitar={quitar} />
      </div>
    </AdminToastCtx.Provider>
  )
}
