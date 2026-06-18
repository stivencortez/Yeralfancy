import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, bannerDeDB, bannerParaDB } from '../lib/supabase'
import { generarId } from '../utils/formatear'

export const useBanners = create(
  persist(
    (set, get) => ({
      banners: [],

      sincronizarDesdeSupabase: async () => {
        try {
          const { data, error } = await supabase
            .from('banners')
            .select('*')
            .order('orden')
          if (error) { console.warn('Supabase banners:', error.message); return }
          set({ banners: data.map(bannerDeDB) })
        } catch (e) {
          console.warn('Error sync banners:', e)
        }
      },

      agregarBanner: async (datos) => {
        const nuevo = { ...datos, id: generarId(), creadoEn: new Date().toISOString() }
        const { error } = await supabase.from('banners').insert(bannerParaDB(nuevo))
        if (error) throw new Error(error.message)
        set(s => ({ banners: [...s.banners, nuevo] }))
        return nuevo
      },

      editarBanner: async (id, datos) => {
        const actual = get().banners.find(b => b.id === id)
        if (!actual) return
        const actualizado = { ...actual, ...datos }
        const { error } = await supabase.from('banners').update(bannerParaDB(actualizado)).eq('id', id)
        if (error) throw new Error(error.message)
        set(s => ({ banners: s.banners.map(b => b.id === id ? actualizado : b) }))
      },

      eliminarBanner: async (id) => {
        const { error } = await supabase.from('banners').delete().eq('id', id)
        if (error) throw new Error(error.message)
        set(s => ({ banners: s.banners.filter(b => b.id !== id) }))
      },

      limpiarBanners: async () => {
        const { error } = await supabase.from('banners').delete().neq('id', '__never__')
        if (error) throw new Error(error.message)
        set({ banners: [] })
      },

      toggleActivo: (id) => {
        const b = get().banners.find(ban => ban.id === id)
        if (!b) return
        const nuevoActivo = !b.activo
        set(s => ({ banners: s.banners.map(ban => ban.id === id ? { ...ban, activo: nuevoActivo } : ban) }))
        supabase.from('banners').update({ activo: nuevoActivo }).eq('id', id)
          .then(({ error }) => {
            if (error) {
              console.error('Error toggleActivo banner:', error)
              set(s => ({ banners: s.banners.map(ban => ban.id === id ? { ...ban, activo: b.activo } : ban) }))
            }
          })
      },

      getActivos: () => [...get().banners.filter(b => b.activo)].sort((a, b) => a.orden - b.orden),
    }),
    { name: 'yf-banners' }
  )
)
