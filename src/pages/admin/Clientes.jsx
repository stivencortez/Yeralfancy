import { useState } from 'react'
import { Search, Users, MessageCircle } from 'lucide-react'
import { useClientes } from '../../store/useClientes'
import { formatearPrecio, formatearFecha, estadoColor } from '../../utils/formatear'
import { abrirWhatsApp } from '../../utils/whatsapp'
import { EstadoVacio } from '../../components/ui/Cargando'

export default function Clientes() {
  const clientes = useClientes(s => s.clientes)
  const [busqueda, setBusqueda] = useState('')

  const filtrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.telefono.includes(busqueda)
  )

  return (
    <div className="animate-fade-in">
      <h1 className="font-bold text-xl text-marca-negro mb-6">Clientes</h1>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl shadow-tarjeta p-3 text-center">
          <p className="text-2xl font-bold text-marca-negro">{clientes.length}</p>
          <p className="text-xs text-marca-texto-suave">Total clientes</p>
        </div>
        <div className="bg-white rounded-2xl shadow-tarjeta p-3 text-center">
          <p className="text-2xl font-bold text-marca-negro">
            {formatearPrecio(clientes.reduce((a, c) => a + (c.totalComprado || 0), 0))}
          </p>
          <p className="text-xs text-marca-texto-suave">Total comprado</p>
        </div>
        <div className="bg-white rounded-2xl shadow-tarjeta p-3 text-center">
          <p className="text-2xl font-bold text-marca-negro">
            {clientes.length ? formatearPrecio(clientes.reduce((a, c) => a + (c.totalComprado || 0), 0) / clientes.length) : '$0.00'}
          </p>
          <p className="text-xs text-marca-texto-suave">Promedio/cliente</p>
        </div>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-marca-texto-suave" />
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por nombre o teléfono..." className="input-campo pl-9" />
      </div>

      <div className="bg-white rounded-2xl shadow-tarjeta overflow-hidden">
        {filtrados.length === 0 ? (
          <EstadoVacio icono={<Users size={32} className="text-marca-beige-borde" />} titulo="Sin clientes aún" descripcion="Los clientes aparecen cuando realizan su primer pedido." />
        ) : (
          <div className="divide-y divide-marca-beige-borde">
            {filtrados.map(c => (
              <div key={c.id} className="p-4 flex items-center gap-3 hover:bg-marca-beige/20 transition-colors">
                <div className="w-10 h-10 bg-marca-beige rounded-xl flex items-center justify-center shrink-0">
                  <span className="font-bold text-marca-marron text-sm">{c.nombre.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-marca-negro text-sm">{c.nombre}</p>
                  <p className="text-xs text-marca-texto-suave">{c.telefono}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-marca-texto-suave">{c.totalPedidos} pedido{c.totalPedidos !== 1 ? 's' : ''}</span>
                    <span className="text-xs font-medium text-emerald-600">{formatearPrecio(c.totalComprado || 0)}</span>
                    <span className="text-xs text-marca-texto-suave">{formatearFecha(c.ultimoPedido)}</span>
                  </div>
                </div>
                <button
                  onClick={() => abrirWhatsApp(c.telefono, `Hola ${c.nombre}, te contactamos de Yeral fancy.`)}
                  className="w-9 h-9 bg-green-50 text-green-600 rounded-xl flex items-center justify-center hover:bg-green-100 active:scale-90 transition-all shrink-0"
                >
                  <MessageCircle size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
