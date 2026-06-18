import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generarId } from '../utils/formatear'

export const useClientes = create(
  persist(
    (set, get) => ({
      clientes: [],

      agregarOActualizarCliente: (nombre, telefono, totalPedido, estadoPedido) => {
        const telLimpio = telefono.replace(/\D/g, '')
        set(s => {
          const existe = s.clientes.find(c => c.telefono === telLimpio)
          if (existe) {
            return {
              clientes: s.clientes.map(c =>
                c.telefono === telLimpio
                  ? {
                      ...c,
                      nombre,
                      totalPedidos: c.totalPedidos + 1,
                      totalComprado: c.totalComprado + (estadoPedido === 'Pago' ? totalPedido : 0),
                      ultimoPedido: new Date().toISOString(),
                      estadoUltimoPedido: estadoPedido,
                    }
                  : c
              ),
            }
          }
          return {
            clientes: [
              ...s.clientes,
              {
                id: generarId(),
                nombre,
                telefono: telLimpio,
                totalPedidos: 1,
                totalComprado: estadoPedido === 'Pago' ? totalPedido : 0,
                ultimoPedido: new Date().toISOString(),
                estadoUltimoPedido: estadoPedido,
                creadoEn: new Date().toISOString(),
              },
            ],
          }
        })
      },
    }),
    { name: 'yf-clientes' }
  )
)
