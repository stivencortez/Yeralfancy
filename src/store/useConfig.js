import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CONFIG_INICIAL } from '../data/datosIniciales'

export const useConfig = create(
  persist(
    (set) => ({
      config: CONFIG_INICIAL,

      actualizarConfig: (datos) => {
        set(s => ({
          config: { ...s.config, ...datos, actualizadoEn: new Date().toISOString() },
        }))
      },
    }),
    { name: 'yf-config' }
  )
)
