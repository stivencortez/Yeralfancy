import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useFavoritos = create(
  persist(
    (set, get) => ({
      favoritos: [],

      toggleFavorito: (productoId) => {
        set(s => {
          const existe = s.favoritos.includes(productoId)
          return { favoritos: existe ? s.favoritos.filter(id => id !== productoId) : [...s.favoritos, productoId] }
        })
      },

      esFavorito: (productoId) => get().favoritos.includes(productoId),
    }),
    { name: 'yf-favoritos' }
  )
)
