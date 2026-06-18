import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, pedidoDeDB, pedidoParaDB } from '../lib/supabase'
import { generarId } from '../utils/formatear'

export const usePedidos = create(
  persist(
    (set, get) => ({
      pedidos: [],

      sincronizarDesdeSupabase: async () => {
        try {
          const { data, error } = await supabase
            .from('pedidos')
            .select('*')
            .order('created_at', { ascending: false })
          if (error) { console.warn('Supabase pedidos:', error.message); return }
          set({ pedidos: data.map(pedidoDeDB) })
        } catch (e) {
          console.warn('Error sync pedidos:', e)
        }
      },

      crearPedido: async (datos) => {
        const costoTotal = (datos.productos || []).reduce((acc, p) => acc + (p.precioCosto || 0) * p.cantidad, 0)
        const gananciaTotal = datos.total - costoTotal
        const nuevo = {
          ...datos,
          id: generarId(),
          costoTotal,
          gananciaTotal,
          estado: 'Pendiente',
          descontadoStock: false,
          creadoEn: new Date().toISOString(),
          actualizadoEn: new Date().toISOString(),
        }
        const { error } = await supabase.from('pedidos').insert(pedidoParaDB(nuevo))
        if (error) throw new Error(error.message)
        set(s => ({ pedidos: [nuevo, ...s.pedidos] }))
        return nuevo
      },

      cambiarEstado: async (id, nuevoEstado, fnDescontarStock) => {
        const pedido = get().pedidos.find(p => p.id === id)
        if (!pedido) return

        const yaEraPago = pedido.estado === 'Pago'
        const ahoraPago = nuevoEstado === 'Pago'

        if (ahoraPago && !yaEraPago && !pedido.descontadoStock && fnDescontarStock) {
          await Promise.all(
            pedido.productos.map(item => fnDescontarStock(item.productoId, item.cantidad))
          )
        }

        const nuevoDescontadoStock = ahoraPago ? true : pedido.descontadoStock
        const { error } = await supabase.from('pedidos')
          .update({
            estado: nuevoEstado,
            descontado_stock: nuevoDescontadoStock,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
        if (error) throw new Error(error.message)

        set(s => ({
          pedidos: s.pedidos.map(p =>
            p.id === id
              ? { ...p, estado: nuevoEstado, descontadoStock: nuevoDescontadoStock, actualizadoEn: new Date().toISOString() }
              : p
          ),
        }))
      },

      limpiarPedidos: async () => {
        const { error } = await supabase.from('pedidos').delete().neq('id', '__never__')
        if (error) throw new Error(error.message)
        set({ pedidos: [] })
      },

      getPedido: (id) => get().pedidos.find(p => p.id === id),
      getPedidosPorEstado: (estado) => get().pedidos.filter(p => p.estado === estado),
      getFacturacionPeriodo: (inicio, fin) => {
        return get().pedidos
          .filter(p => p.estado === 'Pago' && new Date(p.creadoEn) >= inicio && new Date(p.creadoEn) <= fin)
          .reduce((acc, p) => ({ total: acc.total + p.total, ganancia: acc.ganancia + p.gananciaTotal }), { total: 0, ganancia: 0 })
      },
    }),
    { name: 'yf-pedidos' }
  )
)
