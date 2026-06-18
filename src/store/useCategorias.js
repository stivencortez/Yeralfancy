import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CATEGORIAS_INICIALES } from '../data/datosIniciales'
import { generarId } from '../utils/formatear'

export const useCategorias = create(
  persist(
    (set, get) => ({
      categorias: CATEGORIAS_INICIALES,

      agregarCategoria: (datos) => {
        const nueva = {
          ...datos,
          id: generarId(),
          creadoEn: new Date().toISOString(),
        }
        set(s => ({ categorias: [...s.categorias, nueva] }))
        return nueva
      },

      editarCategoria: (id, datos) => {
        set(s => ({
          categorias: s.categorias.map(c => c.id === id ? { ...c, ...datos } : c),
        }))
      },

      eliminarCategoria: (id) => {
        set(s => ({ categorias: s.categorias.filter(c => c.id !== id) }))
      },

      toggleActiva: (id) => {
        set(s => ({
          categorias: s.categorias.map(c => c.id === id ? { ...c, activa: !c.activa } : c),
        }))
      },

      reordenar: (id, nuevoOrden) => {
        set(s => ({
          categorias: s.categorias.map(c => c.id === id ? { ...c, orden: nuevoOrden } : c),
        }))
      },

      getActivas: () => [...get().categorias.filter(c => c.activa)].sort((a, b) => a.orden - b.orden),

      getCategoria: (id) => get().categorias.find(c => c.id === id),
    }),
    { name: 'yf-categorias' }
  )
)
