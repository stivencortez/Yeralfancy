import { Outlet } from 'react-router-dom'
import { Header } from '../components/tienda/Header'
import { BarraInferior } from '../components/tienda/BarraInferior'
import { BotonWhatsApp } from '../components/tienda/BotonWhatsApp'
import { ToastContenedor } from '../components/ui/Toast'
import { useToast } from '../hooks/useToast'
import { createContext, useContext } from 'react'

const ToastCtx = createContext(null)
export const useTiendaToast = () => useContext(ToastCtx)

export function LayoutTienda() {
  const { toasts, agregar, quitar } = useToast()

  return (
    <ToastCtx.Provider value={agregar}>
      <div className="min-h-screen bg-marca-fondo flex flex-col">
        <Header />
        <main className="flex-1 pb-20">
          <Outlet />
        </main>
        <BarraInferior />
        <BotonWhatsApp />
        <ToastContenedor toasts={toasts} quitar={quitar} />
      </div>
    </ToastCtx.Provider>
  )
}
