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

      crearPedido: (datos) => {
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
        set(s => ({ pedidos: [nuevo, ...s.pedidos] }))
        supabase.from('pedidos').insert(pedidoParaDB(nuevo))
          .then(({ error }) => { if (error) console.error('Error guardando pedido:', error) })
        return nuevo
      },

      cambiarEstado: (id, nuevoEstado, fnDescontarStock) => {
        set(s => {
          const pedido = s.pedidos.find(p => p.id === id)
          if (!pedido) return s

          const yaEraPago = pedido.estado === 'Pago'
          const ahoraPago = nuevoEstado === 'Pago'

          if (ahoraPago && !yaEraPago && !pedido.descontadoStock && fnDescontarStock) {
            pedido.productos.forEach(item => {
              fnDescontarStock(item.productoId, item.cantidad)
            })
          }

          return {
            pedidos: s.pedidos.map(p =>
              p.id === id
                ? {
                    ...p,
                    estado: nuevoEstado,
                    descontadoStock: ahoraPago ? true : p.descontadoStock,
                    actualizadoEn: new Date().toISOString(),
                  }
                : p
            ),
          }
        })
        const actualizado = get().pedidos.find(p => p.id === id)
        if (actualizado) {
          supabase.from('pedidos')
            .update({
              estado: actualizado.estado,
              descontado_stock: actualizado.descontadoStock,
              updated_at: new Date().toISOString(),
            })
            .eq('id', id)
        }
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
