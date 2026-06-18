import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, configDeDB, configParaDB } from '../lib/supabase'
import { CONFIG_INICIAL } from '../data/datosIniciales'

export const useConfig = create(
  persist(
    (set, get) => ({
      config: CONFIG_INICIAL,

      sincronizarDesdeSupabase: async () => {
        try {
          const { data, error } = await supabase
            .from('config')
            .select('*')
            .eq('id', 1)
            .single()
          if (error) { console.warn('Supabase config:', error.message); return }
          if (data) set({ config: configDeDB(data) })
        } catch (e) {
          console.warn('Error sync config:', e)
        }
      },

      actualizarConfig: (datos) => {
        set(s => ({
          config: { ...s.config, ...datos, actualizadoEn: new Date().toISOString() },
        }))
        const configActual = get().config
        supabase.from('config')
          .upsert(configParaDB(configActual))
          .then(({ error }) => { if (error) console.error('Error guardando config:', error) })
      },
    }),
    { name: 'yf-config' }
  )
)
