import { X } from 'lucide-react'
import { useEffect } from 'react'

export function Modal({ abierto, onCerrar, titulo, children, tamano = 'md' }) {
  useEffect(() => {
    if (abierto) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [abierto])

  if (!abierto) return null

  const anchos = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onCerrar}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" />
      <div
        className={`relative bg-white rounded-t-3xl sm:rounded-3xl w-full ${anchos[tamano]} max-h-[92vh] overflow-y-auto shadow-modal animate-slide-up z-10`}
        onClick={e => e.stopPropagation()}
      >
        {titulo && (
          <div className="flex items-center justify-between p-5 border-b border-marca-beige-borde sticky top-0 bg-white z-10">
            <h2 className="font-semibold text-lg text-marca-negro">{titulo}</h2>
            <button
              onClick={onCerrar}
              className="w-8 h-8 rounded-full bg-marca-beige flex items-center justify-center hover:bg-marca-beige-borde transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
