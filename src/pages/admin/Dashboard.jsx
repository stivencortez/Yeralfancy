import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ShoppingCart, DollarSign, TrendingUp, Package, Users, AlertTriangle, Star } from 'lucide-react'
import { useProductos } from '../../store/useProductos'
import { usePedidos } from '../../store/usePedidos'
import { useClientes } from '../../store/useClientes'
import { formatearPrecio, estadoColor, formatearFechaHora } from '../../utils/formatear'
import { Link } from 'react-router-dom'

const FILTROS = ['Hoy', 'Esta semana', 'Este mes']

function TarjetaMetrica({ titulo, valor, icono: Icono, color = 'bg-marca-marron', subtitulo }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-tarjeta">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
          <Icono size={20} className="text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-marca-negro">{valor}</p>
      <p className="text-xs text-marca-texto-suave mt-0.5">{titulo}</p>
      {subtitulo && <p className="text-xs text-marca-marron mt-0.5 font-medium">{subtitulo}</p>}
    </div>
  )
}

function calcularRangos(filtro) {
  const ahora = new Date()
  const inicio = new Date(ahora)
  if (filtro === 'Hoy') {
    inicio.setHours(0, 0, 0, 0)
  } else if (filtro === 'Esta semana') {
    const dia = inicio.getDay()
    inicio.setDate(inicio.getDate() - dia)
    inicio.setHours(0, 0, 0, 0)
  } else {
    inicio.setDate(1)
    inicio.setHours(0, 0, 0, 0)
  }
  return { inicio, fin: ahora }
}

export default function Dashboard() {
  const [filtro, setFiltro] = useState('Este mes')
  const productos = useProductos(s => s.productos)
  const pedidos = usePedidos(s => s.pedidos)
  const clientes = useClientes(s => s.clientes)
  const getFacturacion = usePedidos(s => s.getFacturacionPeriodo)

  const { inicio, fin } = calcularRangos(filtro)
  const { total: facturacion, ganancia } = getFacturacion(inicio, fin)

  const pendientes = pedidos.filter(p => p.estado === 'Pendiente').length
  const pagados = pedidos.filter(p => p.estado === 'Pago').length
  const noFinalizados = pedidos.filter(p => p.estado === 'No finalizado').length
  const productosActivos = productos.filter(p => p.activo).length
  const agotados = productos.filter(p => p.activo && p.stock === 0)
  const bajoStock = productos.filter(p => p.activo && p.stock > 0 && p.stock <= p.stockMinimo)

  const masVendidos = [...productos].sort((a, b) => (b.vendidos || 0) - (a.vendidos || 0)).slice(0, 5)

  const pedidosPago = pedidos.filter(p => p.estado === 'Pago')
  const ticketPromedio = pedidosPago.length ? pedidosPago.reduce((a, p) => a + p.total, 0) / pedidosPago.length : 0

  const pedidosRecientes = pedidos.slice(0, 6)

  const datosGrafico = (() => {
    const dias = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      const fin = new Date(d)
      fin.setHours(23, 59, 59)
      const { total, ganancia } = getFacturacion(d, fin)
      dias.push({
        dia: d.toLocaleDateString('es-VE', { weekday: 'short' }),
        ventas: total,
        ganancia,
      })
    }
    return dias
  })()

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-bold text-xl text-marca-negro">Dashboard</h1>
        <div className="flex gap-1 bg-marca-beige rounded-xl p-1">
          {FILTROS.map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                filtro === f ? 'bg-white text-marca-negro shadow-sm' : 'text-marca-texto-suave'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <TarjetaMetrica titulo="Facturación" valor={formatearPrecio(facturacion)} icono={DollarSign} color="bg-emerald-500" />
        <TarjetaMetrica titulo="Ganancia" valor={formatearPrecio(ganancia)} icono={TrendingUp} color="bg-marca-marron" />
        <TarjetaMetrica titulo="Pedidos pendientes" valor={pendientes} icono={ShoppingCart} color="bg-amber-500" />
        <TarjetaMetrica titulo="Pedidos pagados" valor={pagados} icono={ShoppingCart} color="bg-blue-500" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <TarjetaMetrica titulo="Ticket promedio" valor={formatearPrecio(ticketPromedio)} icono={DollarSign} color="bg-violet-500" />
        <TarjetaMetrica titulo="Total clientes" valor={clientes.length} icono={Users} color="bg-pink-500" />
        <TarjetaMetrica titulo="Productos activos" valor={productosActivos} icono={Package} color="bg-teal-500" />
        <TarjetaMetrica titulo="No finalizados" valor={noFinalizados} icono={ShoppingCart} color="bg-gray-400" />
      </div>

      {(agotados.length > 0 || bajoStock.length > 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-amber-600" />
            <h2 className="font-semibold text-amber-800 text-sm">Alertas de inventario</h2>
          </div>
          <div className="space-y-1">
            {agotados.map(p => (
              <div key={p.id} className="flex items-center justify-between text-xs">
                <span className="text-amber-700">{p.nombre}</span>
                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Agotado</span>
              </div>
            ))}
            {bajoStock.map(p => (
              <div key={p.id} className="flex items-center justify-between text-xs">
                <span className="text-amber-700">{p.nombre}</span>
                <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Stock: {p.stock}</span>
              </div>
            ))}
          </div>
          <Link to="/admin/inventario" className="text-xs text-marca-marron font-medium mt-2 block">Ver inventario →</Link>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-tarjeta p-4 mb-6">
        <h2 className="font-semibold text-sm text-marca-negro mb-4">Ventas últimos 7 días</h2>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={datosGrafico}>
            <defs>
              <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9B7B5B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#9B7B5B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F5EFE0" />
            <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#7A6B5E' }} />
            <YAxis tick={{ fontSize: 11, fill: '#7A6B5E' }} />
            <Tooltip
              formatter={(v) => [formatearPrecio(v), 'Ventas']}
              contentStyle={{ borderRadius: 12, border: '1px solid #E8D8C0', boxShadow: 'none', fontSize: 12 }}
            />
            <Area type="monotone" dataKey="ventas" stroke="#9B7B5B" strokeWidth={2} fill="url(#colorVentas)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-tarjeta p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm text-marca-negro flex items-center gap-2">
              <Star size={16} className="text-marca-marron" />
              Más vendidos
            </h2>
            <Link to="/admin/metricas" className="text-xs text-marca-marron">Ver todo</Link>
          </div>
          <div className="space-y-3">
            {masVendidos.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="w-5 h-5 bg-marca-beige rounded-full flex items-center justify-center text-xs font-bold text-marca-marron shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-marca-negro truncate">{p.nombre}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1.5 bg-marca-beige rounded-full overflow-hidden">
                      <div
                        className="h-full bg-marca-marron rounded-full"
                        style={{ width: `${masVendidos[0].vendidos ? ((p.vendidos || 0) / masVendidos[0].vendidos) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-xs text-marca-texto-suave shrink-0">{p.vendidos || 0}</span>
                  </div>
                </div>
              </div>
            ))}
            {!masVendidos.length && <p className="text-xs text-marca-texto-suave text-center py-4">Sin datos aún</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-tarjeta p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm text-marca-negro flex items-center gap-2">
              <ShoppingCart size={16} className="text-marca-marron" />
              Pedidos recientes
            </h2>
            <Link to="/admin/pedidos" className="text-xs text-marca-marron">Ver todos</Link>
          </div>
          <div className="space-y-2">
            {pedidosRecientes.map(p => (
              <Link key={p.id} to="/admin/pedidos" className="flex items-center gap-3 p-2 rounded-xl hover:bg-marca-beige transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-marca-negro truncate">{p.clienteNombre}</p>
                  <p className="text-xs text-marca-texto-suave">{formatearFechaHora(p.creadoEn)}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-xs font-bold text-marca-negro">{formatearPrecio(p.total)}</span>
                  <span className={`badge-estado text-[10px] ${estadoColor(p.estado)}`}>{p.estado}</span>
                </div>
              </Link>
            ))}
            {!pedidosRecientes.length && <p className="text-xs text-marca-texto-suave text-center py-4">Sin pedidos aún</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
