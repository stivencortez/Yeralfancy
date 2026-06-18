import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  DollarSign, TrendingUp, ShoppingBag, Users, Package,
  Clock, BarChart3, AlertTriangle, Star, ArrowRight,
  CheckCircle2, XCircle,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProductos } from '../../store/useProductos'
import { usePedidos } from '../../store/usePedidos'
import { useClientes } from '../../store/useClientes'
import { formatearPrecio, estadoColor, formatearFechaHora } from '../../utils/formatear'
import { Link } from 'react-router-dom'
import { useAdminModoOscuro } from '../../layouts/LayoutAdmin'

/* ─── Animaciones ─────────────────────────────────────────────────────────── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const FILTROS = ['Hoy', 'Esta semana', 'Este mes']

function calcularRangos(filtro) {
  const ahora = new Date()
  const inicio = new Date(ahora)
  if (filtro === 'Hoy') {
    inicio.setHours(0, 0, 0, 0)
  } else if (filtro === 'Esta semana') {
    inicio.setDate(inicio.getDate() - inicio.getDay())
    inicio.setHours(0, 0, 0, 0)
  } else {
    inicio.setDate(1)
    inicio.setHours(0, 0, 0, 0)
  }
  return { inicio, fin: ahora }
}

/* ─── Componentes locales ─────────────────────────────────────────────────── */

/** Tarjeta financiera grande (Facturación / Ganancia) */
function TarjetaFinanciera({ titulo, valor, icono: Icono, nota, acento = false }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="relative bg-white rounded-2xl shadow-tarjeta p-5 overflow-hidden"
    >
      {acento && (
        <div className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-marca-dorado to-marca-marron rounded-l-2xl" />
      )}
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-marca-beige rounded-xl flex items-center justify-center">
          <Icono size={18} className="text-marca-marron" strokeWidth={1.8} />
        </div>
        {nota && (
          <span className="text-[10px] font-semibold text-marca-texto-suave bg-marca-beige px-2 py-1 rounded-full">
            {nota}
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-marca-negro tracking-tight">{valor}</p>
      <p className="text-xs text-marca-texto-suave mt-1.5 font-medium">{titulo}</p>
    </motion.div>
  )
}

/** Tarjeta operacional compacta */
function TarjetaMini({ titulo, valor, icono: Icono, nota }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -1, transition: { duration: 0.15 } }}
      className="bg-white rounded-xl shadow-tarjeta p-4"
    >
      <Icono size={15} className="text-marca-texto-suave mb-3" strokeWidth={1.7} />
      <p className="text-xl font-bold text-marca-negro leading-none">{valor}</p>
      <p className="text-[11px] text-marca-texto-suave mt-1.5 leading-tight">{titulo}</p>
      {nota && <p className="text-[10px] text-marca-marron font-medium mt-1">{nota}</p>}
    </motion.div>
  )
}

/** Empty state elegante */
function EstadoVacio({ icono: Icono, texto, compact = false }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${compact ? 'py-4' : 'py-6'}`}>
      <Icono size={24} className="text-marca-beige-borde opacity-60" strokeWidth={1.4} />
      <p className="text-xs text-marca-texto-suave text-center max-w-[200px] leading-relaxed">{texto}</p>
    </div>
  )
}

/** Tooltip personalizado para el gráfico */
function TooltipGrafico({ active, payload, label, modoOscuro }) {
  if (!active || !payload?.length) return null
  return (
    <div className={`rounded-xl border px-3 py-2 shadow-tarjeta text-xs
      ${modoOscuro ? 'bg-[#2A2419] border-[#3D3426] text-[#EDE8E0]' : 'bg-white border-marca-beige-borde text-marca-negro'}`}>
      <p className="font-semibold mb-1">{label}</p>
      <p>{formatearPrecio(payload[0]?.value || 0)}</p>
    </div>
  )
}

/* ─── Dashboard principal ─────────────────────────────────────────────────── */
export default function Dashboard() {
  const [filtro, setFiltro]   = useState('Este mes')
  const { modoOscuro }        = useAdminModoOscuro()

  const strokeColor = modoOscuro ? '#B89067' : '#9B7B5B'
  const grafColor   = modoOscuro
    ? { grid: 'rgba(255,255,255,0.06)', tick: '#B9AA9A', bg: '#29231E' }
    : { grid: '#F5EFE0',                tick: '#9D8879', bg: '#fff'    }

  const productos      = useProductos(s => s.productos)
  const pedidos        = usePedidos(s => s.pedidos)
  const clientes       = useClientes(s => s.clientes)
  const getFacturacion = usePedidos(s => s.getFacturacionPeriodo)

  const { inicio, fin }              = calcularRangos(filtro)
  const { total: facturacion, ganancia } = getFacturacion(inicio, fin)

  const pendientes      = pedidos.filter(p => p.estado === 'Pendiente').length
  const pagados         = pedidos.filter(p => p.estado === 'Pago').length
  const noFinalizados   = pedidos.filter(p => p.estado === 'No finalizado').length
  const productosActivos = productos.filter(p => p.activo).length
  const agotados        = productos.filter(p => p.activo && p.stock === 0)
  const bajoStock       = productos.filter(p => p.activo && p.stock > 0 && p.stock <= p.stockMinimo)

  const masVendidos = [...productos]
    .sort((a, b) => (b.vendidos || 0) - (a.vendidos || 0))
    .slice(0, 5)

  const pedidosPago   = pedidos.filter(p => p.estado === 'Pago')
  const ticketPromedio = pedidosPago.length
    ? pedidosPago.reduce((a, p) => a + p.total, 0) / pedidosPago.length
    : 0

  const pedidosRecientes = pedidos.slice(0, 6)

  const datosGrafico = (() => {
    const dias = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      const f = new Date(d); f.setHours(23, 59, 59)
      const { total } = getFacturacion(d, f)
      dias.push({ dia: d.toLocaleDateString('es-VE', { weekday: 'short' }), ventas: total })
    }
    return dias
  })()

  const hayVentas = datosGrafico.some(d => d.ventas > 0)

  /* fecha de bienvenida */
  const fechaHoy = new Date().toLocaleDateString('es-VE', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <motion.div
      className="space-y-5"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* ── Bienvenida + filtros ── */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-bold text-xl text-marca-negro leading-tight">Bienvenida de nuevo</h1>
          <p className="text-xs text-marca-texto-suave mt-0.5 capitalize">{fechaHoy}</p>
        </div>
        <div className="flex gap-1 bg-marca-beige rounded-xl p-1 self-start">
          {FILTROS.map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`relative text-xs px-3 py-1.5 rounded-lg font-medium transition-colors duration-150
                ${filtro === f ? 'text-marca-negro' : 'text-marca-texto-suave hover:text-marca-negro'}`}
            >
              {filtro === f && (
                <motion.span
                  layoutId="filtroActivo"
                  className={`absolute inset-0 rounded-lg shadow-sm ${modoOscuro ? 'bg-[#3A2F28]' : 'bg-white'}`}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative">{f}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Tarjetas financieras (héroe) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TarjetaFinanciera
          titulo="Facturación total"
          valor={formatearPrecio(facturacion)}
          icono={DollarSign}
          nota="Ventas confirmadas"
          acento
        />
        <TarjetaFinanciera
          titulo="Ganancia neta"
          valor={formatearPrecio(ganancia)}
          icono={TrendingUp}
          nota="Solo pedidos pagados"
        />
      </div>

      {/* ── Tarjetas operacionales ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <TarjetaMini titulo="Pedidos pendientes"   valor={pendientes}               icono={Clock}         />
        <TarjetaMini titulo="Pedidos pagados"      valor={pagados}                  icono={CheckCircle2}  />
        <TarjetaMini titulo="No finalizados"       valor={noFinalizados}            icono={XCircle}       />
        <TarjetaMini titulo="Ticket promedio"      valor={formatearPrecio(ticketPromedio)} icono={DollarSign} />
        <TarjetaMini titulo="Clientes"             valor={clientes.length}          icono={Users}         />
        <TarjetaMini titulo="Productos activos"    valor={productosActivos}         icono={Package}       />
      </div>

      {/* ── Alertas de inventario ── */}
      <AnimatePresence>
        {(agotados.length > 0 || bajoStock.length > 0) && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl shadow-tarjeta p-4 border border-amber-100"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                  <AlertTriangle size={15} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-marca-negro">Alertas de inventario</p>
                  <p className="text-[11px] text-marca-texto-suave">
                    {agotados.length + bajoStock.length} producto{agotados.length + bajoStock.length !== 1 ? 's' : ''} requiere{agotados.length + bajoStock.length === 1 ? '' : 'n'} atención
                  </p>
                </div>
              </div>
              <Link
                to="/admin/inventario"
                className="text-xs text-marca-marron font-medium hover:text-marca-marron-oscuro transition-colors flex items-center gap-1"
              >
                Ver inventario <ArrowRight size={12} />
              </Link>
            </div>
            <div className="space-y-2">
              {agotados.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2.5 bg-red-50/60 rounded-xl">
                  <span className="text-sm text-marca-negro">{p.nombre}</span>
                  <span className="text-[10px] font-semibold text-red-600 bg-red-100 px-2.5 py-1 rounded-full">Agotado</span>
                </div>
              ))}
              {bajoStock.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2.5 bg-amber-50/60 rounded-xl">
                  <div className="min-w-0">
                    <p className="text-sm text-marca-negro">{p.nombre}</p>
                    <p className="text-[11px] text-marca-texto-suave">Solo {p.stock} {p.stock === 1 ? 'unidad' : 'unidades'}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full ml-3 shrink-0">Bajo stock</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Gráfico + Más vendidos ── */}
      <div className="grid lg:grid-cols-5 gap-4">

        {/* Gráfico */}
        <motion.div variants={fadeUp} className="lg:col-span-3 bg-white rounded-2xl shadow-tarjeta p-4">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-sm font-semibold text-marca-negro">Ventas — últimos 7 días</h2>
              <p className="text-[11px] text-marca-texto-suave mt-0.5">Solo pedidos en estado Pago</p>
            </div>
          </div>
          {hayVentas ? (
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={datosGrafico} margin={{ top: 10, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="grdVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={strokeColor} stopOpacity={0.22} />
                    <stop offset="95%" stopColor={strokeColor} stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke={grafColor.grid} vertical={false} />
                <XAxis
                  dataKey="dia"
                  tick={{ fontSize: 10, fill: grafColor.tick }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: grafColor.tick }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => v === 0 ? '' : `$${v}`}
                />
                <Tooltip content={<TooltipGrafico modoOscuro={modoOscuro} />} />
                <Area
                  type="monotone"
                  dataKey="ventas"
                  stroke={strokeColor}
                  strokeWidth={2}
                  fill="url(#grdVentas)"
                  dot={false}
                  activeDot={{ r: 4, fill: strokeColor, stroke: 'white', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EstadoVacio icono={BarChart3} texto="Aún no hay ventas confirmadas en este periodo" compact />
          )}
        </motion.div>

        {/* Más vendidos */}
        <motion.div variants={fadeUp} className="lg:col-span-2 bg-white rounded-2xl shadow-tarjeta p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Star size={14} className="text-marca-dorado" strokeWidth={2} />
              <h2 className="text-sm font-semibold text-marca-negro">Más vendidos</h2>
            </div>
            <Link to="/admin/metricas" className="text-[11px] text-marca-marron font-medium hover:text-marca-marron-oscuro transition-colors flex items-center gap-0.5">
              Ver todo <ArrowRight size={11} />
            </Link>
          </div>

          {masVendidos.filter(p => (p.vendidos || 0) > 0).length > 0 ? (
            <div className="space-y-3">
              {masVendidos.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-bold
                    ${i === 0 ? 'bg-marca-dorado/15 text-marca-dorado' :
                      i === 1 ? 'bg-marca-beige text-marca-marron' :
                                'bg-marca-beige/60 text-marca-texto-suave'}`}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-marca-negro truncate">{p.nombre}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-marca-beige rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-marca-marron to-marca-dorado rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${masVendidos[0].vendidos ? ((p.vendidos || 0) / masVendidos[0].vendidos) * 100 : 0}%` }}
                          transition={{ duration: 0.6, delay: 0.1 * i, ease: 'easeOut' }}
                        />
                      </div>
                      <span className="text-[10px] text-marca-texto-suave shrink-0">{p.vendidos || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EstadoVacio icono={ShoppingBag} texto="Aún no hay productos vendidos" />
          )}
        </motion.div>
      </div>

      {/* ── Pedidos recientes ── */}
      <motion.div variants={fadeUp} className="bg-white rounded-2xl shadow-tarjeta p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag size={14} className="text-marca-marron" strokeWidth={1.8} />
            <h2 className="text-sm font-semibold text-marca-negro">Pedidos recientes</h2>
          </div>
          <Link to="/admin/pedidos" className="text-[11px] text-marca-marron font-medium hover:text-marca-marron-oscuro transition-colors flex items-center gap-0.5">
            Ver todos <ArrowRight size={11} />
          </Link>
        </div>

        {pedidosRecientes.length > 0 ? (
          <div className="divide-y divide-marca-beige-borde/50">
            {pedidosRecientes.map(p => (
              <Link
                key={p.id}
                to="/admin/pedidos"
                className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0 hover:bg-marca-beige/30 -mx-2 px-2 rounded-xl transition-colors"
              >
                {/* Avatar */}
                <div className="w-8 h-8 bg-marca-beige rounded-full flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-marca-marron">
                    {(p.clienteNombre || '?').charAt(0).toUpperCase()}
                  </span>
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-marca-negro truncate">{p.clienteNombre}</p>
                  <p className="text-[11px] text-marca-texto-suave">{formatearFechaHora(p.creadoEn)}</p>
                </div>
                {/* Monto + estado */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-sm font-bold text-marca-negro">{formatearPrecio(p.total)}</span>
                  <span className={`badge-estado text-[9px] ${estadoColor(p.estado)}`}>{p.estado}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EstadoVacio icono={ShoppingBag} texto="Sin pedidos aún. Cuando lleguen aparecerán aquí." />
        )}
      </motion.div>

    </motion.div>
  )
}
