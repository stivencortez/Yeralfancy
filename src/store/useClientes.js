import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, clienteDeDB, clienteParaDB } from '../lib/supabase'
import { generarId } from '../utils/formatear'

export const useClientes = create(
  persist(
    (set, get) => ({
      clientes: [],

      sincronizarDesdeSupabase: async () => {
        try {
          const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .order('created_at', { ascending: false })
          if (error) { console.warn('Supabase clientes:', error.message); return }
          set({ clientes: data.map(clienteDeDB) })
        } catch (e) {
          console.warn('Error sync clientes:', e)
        }
      },

      agregarOActualizarCliente: (nombre, telefono, totalPedido, estadoPedido) => {
        const telLimpio = telefono.replace(/\D/g, '')
        const ahora = new Date().toISOString()

        set(s => {
          const existe = s.clientes.find(c => c.telefono === telLimpio)
          if (existe) {
            const actualizado = {
              ...existe,
              nombre,
              totalPedidos: existe.totalPedidos + 1,
              totalComprado: existe.totalComprado + (estadoPedido === 'Pago' ? totalPedido : 0),
              ultimoPedido: ahora,
              estadoUltimoPedido: estadoPedido,
            }
            supabase.from('clientes')
              .update(clienteParaDB(actualizado))
              .eq('telefono', telLimpio)
            return {
              clientes: s.clientes.map(c => c.telefono === telLimpio ? actualizado : c),
            }
          }
          const nuevo = {
            id: generarId(),
            nombre,
            telefono: telLimpio,
            totalPedidos: 1,
            totalComprado: estadoPedido === 'Pago' ? totalPedido : 0,
            ultimoPedido: ahora,
            estadoUltimoPedido: estadoPedido,
            creadoEn: ahora,
          }
          supabase.from('clientes').insert(clienteParaDB(nuevo))
          return { clientes: [...s.clientes, nuevo] }
        })
      },
    }),
    { name: 'yf-clientes' }
  )
)
