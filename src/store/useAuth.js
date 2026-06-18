import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { CREDENCIALES_ADMIN } from '../data/datosIniciales'

export const useAuth = create(
  persist(
    (set, get) => ({
      autenticado: false,
      credenciales: { ...CREDENCIALES_ADMIN },

      sincronizarDesdeSupabase: async () => {
        try {
          const { data, error } = await supabase
            .from('credenciales_admin')
            .select('usuario, contrasena')
            .eq('id', 1)
            .single()
          if (error) { console.warn('Supabase auth:', error.message); return }
          if (data) set({ credenciales: { usuario: data.usuario, contrasena: data.contrasena } })
        } catch (e) {
          console.warn('Error sync auth:', e)
        }
      },

      iniciarSesion: async (usuario, contrasena) => {
        // Verificar contra Supabase (fuente de verdad)
        try {
          const { data, error } = await supabase
            .from('credenciales_admin')
            .select('usuario, contrasena')
            .eq('id', 1)
            .single()
          if (!error && data) {
            set({ credenciales: { usuario: data.usuario, contrasena: data.contrasena } })
            if (usuario === data.usuario && contrasena === data.contrasena) {
              set({ autenticado: true })
              return true
            }
            return false
          }
        } catch (e) {
          console.warn('Supabase no disponible, usando credenciales locales')
        }
        // Fallback a credenciales locales (offline)
        const { credenciales } = get()
        if (usuario === credenciales.usuario && contrasena === credenciales.contrasena) {
          set({ autenticado: true })
          return true
        }
        return false
      },

      cerrarSesion: () => set({ autenticado: false }),

      cambiarContrasena: (nueva) => {
        set(s => ({ credenciales: { ...s.credenciales, contrasena: nueva } }))
        supabase.from('credenciales_admin')
          .update({ contrasena: nueva })
          .eq('id', 1)
          .then(({ error }) => { if (error) console.error('Error cambiando contraseña:', error) })
      },
    }),
    { name: 'yf-auth' }
  )
)
