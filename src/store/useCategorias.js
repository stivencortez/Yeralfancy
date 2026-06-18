import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, categoriaDeDB, categoriaParaDB } from '../lib/supabase'
import { generarId } from '../utils/formatear'

export const useCategorias = create(
  persist(
    (set, get) => ({
      categorias: [],

      sincronizarDesdeSupabase: async () => {
        try {
          const { data, error } = await supabase
            .from('categorias')
            .select('*')
            .order('orden')
          if (error) { console.warn('Supabase categorias:', error.message); return }
          set({ categorias: data.map(categoriaDeDB) })
        } catch (e) {
          console.warn('Error sync categorias:', e)
        }
      },

      agregarCategoria: async (datos) => {
        const nueva = { ...datos, id: generarId(), creadoEn: new Date().toISOString() }
        const { error } = await supabase.from('categorias').insert(categoriaParaDB(nueva))
        if (error) throw new Error(error.message)
        set(s => ({ categorias: [...s.categorias, nueva] }))
        return nueva
      },

      editarCategoria: async (id, datos) => {
        const actual = get().categorias.find(c => c.id === id)
        if (!actual) return
        const actualizada = { ...actual, ...datos }
        const { error } = await supabase.from('categorias').update(categoriaParaDB(actualizada)).eq('id', id)
        if (error) throw new Error(error.message)
        set(s => ({ categorias: s.categorias.map(c => c.id === id ? actualizada : c) }))
      },

      eliminarCategoria: async (id) => {
        const { error } = await supabase.from('categorias').delete().eq('id', id)
        if (error) throw new Error(error.message)
        set(s => ({ categorias: s.categorias.filter(c => c.id !== id) }))
      },

      limpiarCategorias: async () => {
        const { error } = await supabase.from('categorias').delete().neq('id', '__never__')
        if (error) throw new Error(error.message)
        set({ categorias: [] })
      },

      toggleActiva: (id) => {
        const c = get().categorias.find(cat => cat.id === id)
        if (!c) return
        const nuevaActiva = !c.activa
        set(s => ({
          categorias: s.categorias.map(cat =>
            cat.id === id ? { ...cat, activa: nuevaActiva } : cat
          ),
        }))
        supabase.from('categorias').update({ activa: nuevaActiva }).eq('id', id)
          .then(({ error }) => {
            if (error) {
              console.error('Error toggleActiva:', error)
              set(s => ({
                categorias: s.categorias.map(cat => cat.id === id ? { ...cat, activa: c.activa } : cat),
              }))
            }
          })
      },

      reordenar: (id, nuevoOrden) => {
        set(s => ({
          categorias: s.categorias.map(c => c.id === id ? { ...c, orden: nuevoOrden } : c),
        }))
        supabase.from('categorias').update({ orden: nuevoOrden }).eq('id', id)
          .then(({ error }) => { if (error) console.error('Error reordenar:', error) })
      },

      getActivas: () => [...get().categorias.filter(c => c.activa)].sort((a, b) => a.orden - b.orden),
      getCategoria: (id) => get().categorias.find(c => c.id === id),
    }),
    { name: 'yf-categorias' }
  )
)
