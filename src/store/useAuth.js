import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CREDENCIALES_ADMIN } from '../data/datosIniciales'

export const useAuth = create(
  persist(
    (set, get) => ({
      autenticado: false,
      credenciales: { ...CREDENCIALES_ADMIN },

      iniciarSesion: (usuario, contrasena) => {
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
      },
    }),
    { name: 'yf-auth' }
  )
)
