import { Outlet } from 'react-router-dom'
import { Header } from '../components/tienda/Header'
import { BarraInferior } from '../components/tienda/BarraInferior'
import { ToastContenedor } from '../components/ui/Toast'
import { useToast } from '../hooks/useToast'
import { createContext, useContext } from 'react'
import PWAIntroGate from '../components/pwa/PWAIntroGate'

const ToastCtx = createContext(null)
export const useTiendaToast = () => useContext(ToastCtx)

export function LayoutTienda() {
  const { toasts, agregar, quitar } = useToast()

  return (
    <ToastCtx.Provider value={agregar}>
      <div className="min-h-screen bg-marca-fondo flex flex-col">
        <Header />
        <main className="flex-1 pb-32 lg:pb-0">
          <Outlet />
        </main>
        <BarraInferior />
        <ToastContenedor toasts={toasts} quitar={quitar} />
        <PWAIntroGate />
      </div>
    </ToastCtx.Provider>
  )
}
