import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, categoriaDeDB, categoriaParaDB } from '../lib/supabase'
import { CATEGORIAS_INICIALES } from '../data/datosIniciales'
import { generarId } from '../utils/formatear'

export const useCategorias = create(
  persist(
    (set, get) => ({
      categorias: CATEGORIAS_INICIALES,

      sincronizarDesdeSupabase: async () => {
        try {
          const { data, error } = await supabase
            .from('categorias')
            .select('*')
            .order('orden')
          if (error) { console.warn('Supabase categorias:', error.message); return }
          if (data.length === 0) {
            await supabase.from('categorias').insert(CATEGORIAS_INICIALES.map(categoriaParaDB))
          } else {
            set({ categorias: data.map(categoriaDeDB) })
          }
        } catch (e) {
          console.warn('Error sync categorias:', e)
        }
      },

      agregarCategoria: (datos) => {
        const nueva = { ...datos, id: generarId(), creadoEn: new Date().toISOString() }
        set(s => ({ categorias: [...s.categorias, nueva] }))
        supabase.from('categorias').insert(categoriaParaDB(nueva))
          .then(({ error }) => { if (error) console.error('Error guardando categoria:', error) })
        return nueva
      },

      editarCategoria: (id, datos) => {
        set(s => ({
          categorias: s.categorias.map(c => c.id === id ? { ...c, ...datos } : c),
        }))
        const c = get().categorias.find(cat => cat.id === id)
        if (c) supabase.from('categorias').update(categoriaParaDB(c)).eq('id', id)
      },

      eliminarCategoria: (id) => {
        set(s => ({ categorias: s.categorias.filter(c => c.id !== id) }))
        supabase.from('categorias').delete().eq('id', id)
      },

      toggleActiva: (id) => {
        set(s => ({
          categorias: s.categorias.map(c => c.id === id ? { ...c, activa: !c.activa } : c),
        }))
        const c = get().categorias.find(cat => cat.id === id)
        if (c) supabase.from('categorias').update({ activa: c.activa }).eq('id', id)
      },

      reordenar: (id, nuevoOrden) => {
        set(s => ({
          categorias: s.categorias.map(c => c.id === id ? { ...c, orden: nuevoOrden } : c),
        }))
        supabase.from('categorias').update({ orden: nuevoOrden }).eq('id', id)
      },

      getActivas: () => [...get().categorias.filter(c => c.activa)].sort((a, b) => a.orden - b.orden),
      getCategoria: (id) => get().categorias.find(c => c.id === id),
    }),
    { name: 'yf-categorias' }
  )
)
