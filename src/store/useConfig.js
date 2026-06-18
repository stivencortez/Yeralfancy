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

      actualizarConfig: async (datos) => {
        const nuevaConfig = { ...get().config, ...datos, actualizadoEn: new Date().toISOString() }
        const configDB = configParaDB(nuevaConfig)
        const { error } = await supabase.from('config').upsert(configDB)
        let guardadoParcial = false

        if (error) {
          const faltaLogoDark = error.message?.includes('logo_dark') || error.code === 'PGRST204'
          if (!faltaLogoDark) throw new Error(error.message)

          const configCompatible = { ...configDB }
          delete configCompatible.logo_dark
          const { error: retryError } = await supabase.from('config').upsert(configCompatible)
          if (retryError) throw new Error(retryError.message)
          guardadoParcial = true
        }

        const configFinal = guardadoParcial ? { ...nuevaConfig, logoDark: get().config.logoDark || null } : nuevaConfig
        set({ config: configFinal })
        return { guardadoParcial }
      },
    }),
    { name: 'yf-config' }
  )
)
