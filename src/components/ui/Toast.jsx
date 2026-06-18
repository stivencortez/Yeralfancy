import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

const iconos = {
  exito: <CheckCircle size={18} className="text-emerald-500 shrink-0" />,
  error: <XCircle size={18} className="text-red-500 shrink-0" />,
  aviso: <AlertCircle size={18} className="text-amber-500 shrink-0" />,
}

export function ToastContenedor({ toasts, quitar }) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-modal border border-marca-beige-borde animate-slide-up pointer-events-auto"
        >
          {iconos[t.tipo] || iconos.exito}
          <span className="text-sm text-marca-texto font-medium flex-1">{t.mensaje}</span>
          <button onClick={() => quitar(t.id)} className="text-marca-texto-suave hover:text-marca-texto transition-colors">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
