import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, productoDeDB, productoParaDB } from '../lib/supabase'
import { PRODUCTOS_INICIALES } from '../data/datosIniciales'
import { generarId } from '../utils/formatear'

export const useProductos = create(
  persist(
    (set, get) => ({
      productos: PRODUCTOS_INICIALES,

      sincronizarDesdeSupabase: async () => {
        try {
          const { data, error } = await supabase
            .from('productos')
            .select('*')
            .order('created_at')
          if (error) { console.warn('Supabase productos:', error.message); return }
          if (data.length === 0) {
            await supabase.from('productos').insert(PRODUCTOS_INICIALES.map(productoParaDB))
          } else {
            set({ productos: data.map(productoDeDB) })
          }
        } catch (e) {
          console.warn('Error sync productos:', e)
        }
      },

      agregarProducto: (datos) => {
        const nuevo = {
          ...datos,
          id: generarId(),
          vendidos: 0,
          creadoEn: new Date().toISOString(),
          actualizadoEn: new Date().toISOString(),
        }
        set(s => ({ productos: [...s.productos, nuevo] }))
        supabase.from('productos').insert(productoParaDB(nuevo)).then(({ error }) => {
          if (error) console.error('Error guardando producto:', error)
        })
        return nuevo
      },

      editarProducto: (id, datos) => {
        set(s => ({
          productos: s.productos.map(p =>
            p.id === id ? { ...p, ...datos, actualizadoEn: new Date().toISOString() } : p
          ),
        }))
        const actualizado = get().productos.find(p => p.id === id)
        if (actualizado) {
          supabase.from('productos')
            .update({ ...productoParaDB(actualizado), updated_at: new Date().toISOString() })
            .eq('id', id)
            .then(({ error }) => { if (error) console.error('Error editando producto:', error) })
        }
      },

      eliminarProducto: (id) => {
        set(s => ({ productos: s.productos.filter(p => p.id !== id) }))
        supabase.from('productos').delete().eq('id', id)
          .then(({ error }) => { if (error) console.error('Error eliminando producto:', error) })
      },

      toggleActivo: (id) => {
        set(s => ({
          productos: s.productos.map(p =>
            p.id === id ? { ...p, activo: !p.activo, actualizadoEn: new Date().toISOString() } : p
          ),
        }))
        const p = get().productos.find(prod => prod.id === id)
        if (p) supabase.from('productos').update({ activo: p.activo, updated_at: new Date().toISOString() }).eq('id', id)
      },

      toggleDestacado: (id) => {
        set(s => ({
          productos: s.productos.map(p =>
            p.id === id ? { ...p, destacado: !p.destacado, actualizadoEn: new Date().toISOString() } : p
          ),
        }))
        const p = get().productos.find(prod => prod.id === id)
        if (p) supabase.from('productos').update({ destacado: p.destacado, updated_at: new Date().toISOString() }).eq('id', id)
      },

      actualizarStock: (id, cantidad) => {
        const nuevoStock = Math.max(0, cantidad)
        set(s => ({
          productos: s.productos.map(p =>
            p.id === id ? { ...p, stock: nuevoStock, actualizadoEn: new Date().toISOString() } : p
          ),
        }))
        supabase.from('productos').update({ stock: nuevoStock, updated_at: new Date().toISOString() }).eq('id', id)
      },

      descontarStock: (id, cantidad) => {
        set(s => ({
          productos: s.productos.map(p =>
            p.id === id
              ? { ...p, stock: Math.max(0, p.stock - cantidad), vendidos: (p.vendidos || 0) + cantidad, actualizadoEn: new Date().toISOString() }
              : p
          ),
        }))
        const p = get().productos.find(prod => prod.id === id)
        if (p) {
          supabase.from('productos')
            .update({ stock: p.stock, vendidos: p.vendidos, updated_at: new Date().toISOString() })
            .eq('id', id)
        }
      },

      getProducto: (id) => get().productos.find(p => p.id === id),
      getProductosActivos: () => get().productos.filter(p => p.activo),
      getDestacados: () => get().productos.filter(p => p.activo && p.destacado),
      getPorCategoria: (categoriaId) => get().productos.filter(p => p.activo && p.categoriaId === categoriaId),
      getMasVendidos: () => [...get().productos.filter(p => p.activo)].sort((a, b) => (b.vendidos || 0) - (a.vendidos || 0)),
      getBajoStock: () => get().productos.filter(p => p.activo && p.stock > 0 && p.stock <= p.stockMinimo),
      getAgotados: () => get().productos.filter(p => p.activo && p.stock === 0),
    }),
    { name: 'yf-productos' }
  )
)
