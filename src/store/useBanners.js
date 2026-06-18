import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, bannerDeDB, bannerParaDB } from '../lib/supabase'
import { BANNERS_INICIALES } from '../data/datosIniciales'
import { generarId } from '../utils/formatear'

export const useBanners = create(
  persist(
    (set, get) => ({
      banners: BANNERS_INICIALES,

      sincronizarDesdeSupabase: async () => {
        try {
          const { data, error } = await supabase
            .from('banners')
            .select('*')
            .order('orden')
          if (error) { console.warn('Supabase banners:', error.message); return }
          if (data.length === 0) {
            await supabase.from('banners').insert(BANNERS_INICIALES.map(bannerParaDB))
          } else {
            set({ banners: data.map(bannerDeDB) })
          }
        } catch (e) {
          console.warn('Error sync banners:', e)
        }
      },

      agregarBanner: (datos) => {
        const nuevo = { ...datos, id: generarId(), creadoEn: new Date().toISOString() }
        set(s => ({ banners: [...s.banners, nuevo] }))
        supabase.from('banners').insert(bannerParaDB(nuevo))
      },

      editarBanner: (id, datos) => {
        set(s => ({ banners: s.banners.map(b => b.id === id ? { ...b, ...datos } : b) }))
        const b = get().banners.find(ban => ban.id === id)
        if (b) supabase.from('banners').update(bannerParaDB(b)).eq('id', id)
      },

      eliminarBanner: (id) => {
        set(s => ({ banners: s.banners.filter(b => b.id !== id) }))
        supabase.from('banners').delete().eq('id', id)
      },

      toggleActivo: (id) => {
        set(s => ({ banners: s.banners.map(b => b.id === id ? { ...b, activo: !b.activo } : b) }))
        const b = get().banners.find(ban => ban.id === id)
        if (b) supabase.from('banners').update({ activo: b.activo }).eq('id', id)
      },

      getActivos: () => [...get().banners.filter(b => b.activo)].sort((a, b) => a.orden - b.orden),
    }),
    { name: 'yf-banners' }
  )
)
