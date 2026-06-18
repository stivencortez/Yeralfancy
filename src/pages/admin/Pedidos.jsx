import { useState } from 'react'
import { Search, MessageCircle, ChevronDown, Filter } from 'lucide-react'
import { usePedidos } from '../../store/usePedidos'
import { useProductos } from '../../store/useProductos'
import { useAdminToast } from '../../layouts/LayoutAdmin'
import { Modal } from '../../components/ui/Modal'
import { formatearPrecio, formatearFechaHora, estadoColor, ESTADOS_PEDIDO } from '../../utils/formatear'
import { abrirWhatsApp } from '../../utils/whatsapp'
import { useConfig } from '../../store/useConfig'

export default function Pedidos() {
  const { pedidos, cambiarEstado } = usePedidos()
  const descontarStock = useProductos(s => s.descontarStock)
  const whatsapp = useConfig(s => s.config.whatsapp)
  const toast = useAdminToast()

  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [pedidoDetalle, setPedidoDetalle] = useState(null)

  const filtrados = pedidos.filter(p => {
    const porNombre = p.clienteNombre.toLowerCase().includes(busqueda.toLowerCase())
    const porEstado = !filtroEstado || p.estado === filtroEstado
    return porNombre && porEstado
  })

  const manejarCambiarEstado = (pedidoId, nuevoEstado) => {
    cambiarEstado(pedidoId, nuevoEstado, descontarStock)
    toast(`Estado actualizado: ${nuevoEstado}`, 'exito')
    if (pedidoDetalle?.id === pedidoId) {
      setPedidoDetalle(prev => ({ ...prev, estado: nuevoEstado }))
    }
  }

  return (
    <div className="animate-fade-in">
      <h1 className="font-bold text-xl text-marca-negro mb-6">Pedidos</h1>

      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-marca-texto-suave" />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar cliente..." className="input-campo pl-9" />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-marca-texto-suave" />
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="input-campo pl-8 pr-8">
            <option value="">Todos los estados</option>
            {ESTADOS_PEDIDO.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-tarjeta overflow-hidden">
        {filtrados.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-marca-texto-suave text-sm">Sin pedidos encontrados</p>
          </div>
        ) : (
          <div className="divide-y divide-marca-beige-borde">
            {filtrados.map(p => (
              <div key={p.id} className="p-4 hover:bg-marca-beige/20 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setPedidoDetalle(p)}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-marca-texto-suave">#{p.id.slice(-6).toUpperCase()}</span>
                      <span className={`badge-estado ${estadoColor(p.estado)}`}>{p.estado}</span>
                    </div>
                    <p className="font-semibold text-marca-negro text-sm">{p.clienteNombre}</p>
                    <p className="text-xs text-marca-texto-suave">{p.clienteTelefono} · {formatearFechaHora(p.creadoEn)}</p>
                    <p className="text-xs text-marca-texto-suave mt-0.5">{p.productos.length} producto{p.productos.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="font-bold text-marca-negro">{formatearPrecio(p.total)}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => abrirWhatsApp(p.clienteTelefono, `Hola ${p.clienteNombre}, te contactamos de Yeral fancy sobre tu pedido #${p.id.slice(-6).toUpperCase()}.`)}
                        className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors"
                      >
                        <MessageCircle size={13} />
                      </button>
                      <div className="relative">
                        <select
                          value={p.estado}
                          onChange={e => manejarCambiarEstado(p.id, e.target.value)}
                          className="h-7 bg-marca-beige border border-transparent text-xs px-2 rounded-lg text-marca-negro font-medium cursor-pointer hover:border-marca-marron transition-colors appearance-none pr-6"
                        >
                          {ESTADOS_PEDIDO.map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                        <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-marca-texto-suave pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal abierto={!!pedidoDetalle} onCerrar={() => setPedidoDetalle(null)} titulo="Detalle del pedido">
        {pedidoDetalle && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-marca-texto-suave">#{pedidoDetalle.id.slice(-6).toUpperCase()}</span>
              <span className={`badge-estado ${estadoColor(pedidoDetalle.estado)}`}>{pedidoDetalle.estado}</span>
            </div>
            <div className="bg-marca-beige rounded-xl p-3">
              <p className="font-semibold text-marca-negro">{pedidoDetalle.clienteNombre}</p>
              <p className="text-sm text-marca-texto-suave">{pedidoDetalle.clienteTelefono}</p>
              <p className="text-xs text-marca-texto-suave mt-1">{formatearFechaHora(pedidoDetalle.creadoEn)}</p>
            </div>
            <div>
              <h3 className="font-semibold text-sm text-marca-negro mb-2">Productos</h3>
              <div className="space-y-2">
                {pedidoDetalle.productos.map((prod, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-marca-beige-borde last:border-0">
                    {prod.foto && <img src={prod.foto} alt="" className="w-10 h-10 rounded-lg object-cover bg-marca-beige shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-marca-negro truncate">{prod.nombre}</p>
                      <p className="text-xs text-marca-texto-suave">Cant: {prod.cantidad} · {formatearPrecio(prod.precioVenta)} c/u</p>
                    </div>
                    <span className="font-bold text-sm text-marca-negro shrink-0">{formatearPrecio(prod.precioVenta * prod.cantidad)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-marca-beige rounded-xl p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-marca-texto-suave">Total</span>
                <span className="font-bold text-marca-negro">{formatearPrecio(pedidoDetalle.total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-marca-texto-suave">Costo</span>
                <span className="text-marca-texto-suave">{formatearPrecio(pedidoDetalle.costoTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-marca-texto-suave">Ganancia</span>
                <span className="font-semibold text-emerald-600">{formatearPrecio(pedidoDetalle.gananciaTotal)}</span>
              </div>
            </div>
            <div>
              <label className="etiqueta">Cambiar estado</label>
              <select
                value={pedidoDetalle.estado}
                onChange={e => manejarCambiarEstado(pedidoDetalle.id, e.target.value)}
                className="input-campo"
              >
                {ESTADOS_PEDIDO.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => abrirWhatsApp(pedidoDetalle.clienteTelefono, `Hola ${pedidoDetalle.clienteNombre}, te contactamos de Yeral fancy.`)}
                className="flex-1 h-10 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <MessageCircle size={16} /> WhatsApp
              </button>
              <button onClick={() => setPedidoDetalle(null)} className="flex-1 btn-outline py-2 text-sm">Cerrar</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
