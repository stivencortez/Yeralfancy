export function Cargando({ texto = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-10 h-10 border-3 border-marca-beige-borde border-t-marca-marron rounded-full animate-spin" style={{ borderWidth: 3 }} />
      <p className="text-sm text-marca-texto-suave">{texto}</p>
    </div>
  )
}

export function EsqueletoTarjeta() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-tarjeta">
      <div className="w-full aspect-square shimmer-bg" />
      <div className="p-3 space-y-2">
        <div className="h-4 w-3/4 shimmer-bg rounded" />
        <div className="h-4 w-1/2 shimmer-bg rounded" />
      </div>
    </div>
  )
}

export function EstadoVacio({ icono, titulo, descripcion, accion }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
      {icono && <div className="text-4xl mb-2">{icono}</div>}
      <p className="font-semibold text-marca-negro">{titulo}</p>
      {descripcion && <p className="text-sm text-marca-texto-suave max-w-xs">{descripcion}</p>}
      {accion}
    </div>
  )
}
