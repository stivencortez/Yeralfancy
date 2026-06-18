import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useProductos } from '../../store/useProductos'
import { usePedidos } from '../../store/usePedidos'
import { formatearPrecio } from '../../utils/formatear'

const COLORES = ['#9B7B5B', '#C9A96E', '#B89070', '#7A5C3A', '#D4B896', '#E8C9A0', '#6B4C2A']

export default function Metricas() {
  const productos = useProductos(s => s.productos)
  const pedidos = usePedidos(s => s.pedidos)

  const masVendidos = [...productos].sort((a, b) => (b.vendidos || 0) - (a.vendidos || 0)).slice(0, 8)
  const menosVendidos = [...productos].filter(p => p.activo).sort((a, b) => (a.vendidos || 0) - (b.vendidos || 0)).slice(0, 5)
  const mejorGanancia = [...productos].filter(p => p.activo).sort((a, b) => (b.precioVenta - b.precioCosto) - (a.precioVenta - a.precioCosto)).slice(0, 5)
  const sinVentas = productos.filter(p => p.activo && (!p.vendidos || p.vendidos === 0))

  const estadosPedidos = ['Pendiente', 'Pago', 'En envío', 'Entregado', 'Cancelado'].map(e => ({
    name: e,
    value: pedidos.filter(p => p.estado === e).length,
  })).filter(d => d.value > 0)

  const datosRanking = masVendidos.map(p => ({
    nombre: p.nombre.length > 16 ? p.nombre.slice(0, 14) + '...' : p.nombre,
    vendidos: p.vendidos || 0,
    ganancia: (p.precioVenta - p.precioCosto) * (p.vendidos || 0),
  }))

  const totalVendidos = productos.reduce((a, p) => a + (p.vendidos || 0), 0)

  return (
    <div className="animate-fade-in">
      <h1 className="font-bold text-xl text-marca-negro mb-6">Métricas</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-2xl shadow-tarjeta p-4 text-center">
          <p className="text-2xl font-bold text-marca-negro">{totalVendidos}</p>
          <p className="text-xs text-marca-texto-suave">Unidades vendidas</p>
        </div>
        <div className="bg-white rounded-2xl shadow-tarjeta p-4 text-center">
          <p className="text-2xl font-bold text-marca-negro">{pedidos.filter(p => p.estado === 'Pago').length}</p>
          <p className="text-xs text-marca-texto-suave">Ventas confirmadas</p>
        </div>
        <div className="bg-white rounded-2xl shadow-tarjeta p-4 text-center">
          <p className="text-2xl font-bold text-marca-negro">{sinVentas.length}</p>
          <p className="text-xs text-marca-texto-suave">Sin ventas</p>
        </div>
        <div className="bg-white rounded-2xl shadow-tarjeta p-4 text-center">
          <p className="text-2xl font-bold text-marca-negro">{formatearPrecio(productos.reduce((a, p) => a + (p.precioVenta - p.precioCosto) * (p.vendidos || 0), 0))}</p>
          <p className="text-xs text-marca-texto-suave">Ganancia total</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-tarjeta p-4">
          <h2 className="font-semibold text-sm text-marca-negro mb-4">Ranking de ventas</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={datosRanking} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#F5EFE0" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#7A6B5E' }} />
              <YAxis type="category" dataKey="nombre" tick={{ fontSize: 10, fill: '#7A6B5E' }} width={80} />
              <Tooltip
                formatter={(v, n) => [n === 'vendidos' ? `${v} uds` : formatearPrecio(v), n === 'vendidos' ? 'Vendidos' : 'Ganancia']}
                contentStyle={{ borderRadius: 12, border: '1px solid #E8D8C0', fontSize: 11 }}
              />
              <Bar dataKey="vendidos" fill="#9B7B5B" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-tarjeta p-4">
          <h2 className="font-semibold text-sm text-marca-negro mb-4">Estado de pedidos</h2>
          {estadosPedidos.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={estadosPedidos} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                    {estadosPedidos.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E8D8C0', fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {estadosPedidos.map((d, i) => (
                  <span key={d.name} className="text-xs flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORES[i] }} />
                    {d.name}: {d.value}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-marca-texto-suave text-sm">Sin datos de pedidos</div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-tarjeta p-4">
          <h2 className="font-semibold text-sm text-marca-negro mb-3">Mejor ganancia</h2>
          <div className="space-y-2">
            {mejorGanancia.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 bg-emerald-50 rounded-full flex items-center justify-center text-xs font-bold text-emerald-600">{i + 1}</span>
                  <span className="text-xs text-marca-negro truncate max-w-[120px]">{p.nombre}</span>
                </div>
                <span className="text-xs font-semibold text-emerald-600">{formatearPrecio(p.precioVenta - p.precioCosto)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-tarjeta p-4">
          <h2 className="font-semibold text-sm text-marca-negro mb-3">Menos vendidos</h2>
          <div className="space-y-2">
            {menosVendidos.map((p, i) => (
              <div key={p.id} className="flex items-center justify-between">
                <span className="text-xs text-marca-negro truncate max-w-[140px]">{p.nombre}</span>
                <span className="text-xs text-marca-texto-suave">{p.vendidos || 0} vend.</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-tarjeta p-4">
          <h2 className="font-semibold text-sm text-marca-negro mb-3">Sin ventas ({sinVentas.length})</h2>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {sinVentas.length === 0 ? (
              <p className="text-xs text-marca-texto-suave text-center py-4">¡Todos tus productos han vendido!</p>
            ) : (
              sinVentas.map(p => (
                <div key={p.id} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0" />
                  <span className="text-xs text-marca-negro truncate">{p.nombre}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
