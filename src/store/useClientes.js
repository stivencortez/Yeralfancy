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

      agregarOActualizarCliente: async (nombre, telefono, totalPedido, estadoPedido) => {
        const telLimpio = telefono.replace(/\D/g, '')
        if (!telLimpio) throw new Error('El cliente no tiene telefono valido')

        const ahora = new Date().toISOString()
        const local = get().clientes.find(c => c.telefono === telLimpio)
        let existe = local

        if (!existe) {
          const { data, error } = await supabase
            .from('clientes')
            .select('*')
            .eq('telefono', telLimpio)
            .maybeSingle()
          if (error) throw new Error(error.message)
          if (data) existe = clienteDeDB(data)
        }

        if (existe) {
          const actualizado = {
            ...existe,
            nombre: nombre || existe.nombre,
            telefono: telLimpio,
            totalPedidos: (existe.totalPedidos || 0) + 1,
            totalComprado: existe.totalComprado + (estadoPedido === 'Pago' ? totalPedido : 0),
            ultimoPedido: ahora,
            estadoUltimoPedido: estadoPedido,
          }

          const { error } = await supabase.from('clientes')
            .update(clienteParaDB(actualizado))
            .eq('telefono', telLimpio)
          if (error) throw new Error(error.message)

          set(s => {
            const yaExisteLocal = s.clientes.some(c => c.telefono === telLimpio)
            return {
              clientes: yaExisteLocal
                ? s.clientes.map(c => c.telefono === telLimpio ? actualizado : c)
                : [actualizado, ...s.clientes],
            }
          })
          return actualizado
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

        const { error } = await supabase.from('clientes').insert(clienteParaDB(nuevo))
        if (error) throw new Error(error.message)

        set(s => ({ clientes: [nuevo, ...s.clientes.filter(c => c.telefono !== telLimpio)] }))
        return nuevo
      },

      limpiarClientes: async () => {
        const { error } = await supabase.from('clientes').delete().neq('id', '__never__')
        if (error) throw new Error(error.message)
        set({ clientes: [] })
      },
    }),
    { name: 'yf-clientes' }
  )
)
