import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BANNERS_INICIALES } from '../data/datosIniciales'
import { generarId } from '../utils/formatear'

export const useBanners = create(
  persist(
    (set, get) => ({
      banners: BANNERS_INICIALES,

      agregarBanner: (datos) => {
        const nuevo = { ...datos, id: generarId(), creadoEn: new Date().toISOString() }
        set(s => ({ banners: [...s.banners, nuevo] }))
      },

      editarBanner: (id, datos) => {
        set(s => ({ banners: s.banners.map(b => b.id === id ? { ...b, ...datos } : b) }))
      },

      eliminarBanner: (id) => {
        set(s => ({ banners: s.banners.filter(b => b.id !== id) }))
      },

      toggleActivo: (id) => {
        set(s => ({ banners: s.banners.map(b => b.id === id ? { ...b, activo: !b.activo } : b) }))
      },

      getActivos: () => [...get().banners.filter(b => b.activo)].sort((a, b) => a.orden - b.orden),
    }),
    { name: 'yf-banners' }
  )
)
