import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PRODUCTOS_INICIALES } from '../data/datosIniciales'
import { generarId } from '../utils/formatear'

export const useProductos = create(
  persist(
    (set, get) => ({
      productos: PRODUCTOS_INICIALES,

      agregarProducto: (datos) => {
        const nuevo = {
          ...datos,
          id: generarId(),
          vendidos: 0,
          creadoEn: new Date().toISOString(),
          actualizadoEn: new Date().toISOString(),
        }
        set(s => ({ productos: [...s.productos, nuevo] }))
        return nuevo
      },

      editarProducto: (id, datos) => {
        set(s => ({
          productos: s.productos.map(p =>
            p.id === id ? { ...p, ...datos, actualizadoEn: new Date().toISOString() } : p
          ),
        }))
      },

      eliminarProducto: (id) => {
        set(s => ({ productos: s.productos.filter(p => p.id !== id) }))
      },

      toggleActivo: (id) => {
        set(s => ({
          productos: s.productos.map(p =>
            p.id === id ? { ...p, activo: !p.activo, actualizadoEn: new Date().toISOString() } : p
          ),
        }))
      },

      toggleDestacado: (id) => {
        set(s => ({
          productos: s.productos.map(p =>
            p.id === id ? { ...p, destacado: !p.destacado, actualizadoEn: new Date().toISOString() } : p
          ),
        }))
      },

      actualizarStock: (id, cantidad) => {
        set(s => ({
          productos: s.productos.map(p =>
            p.id === id ? { ...p, stock: Math.max(0, cantidad), actualizadoEn: new Date().toISOString() } : p
          ),
        }))
      },

      descontarStock: (id, cantidad) => {
        set(s => ({
          productos: s.productos.map(p =>
            p.id === id ? { ...p, stock: Math.max(0, p.stock - cantidad), vendidos: (p.vendidos || 0) + cantidad, actualizadoEn: new Date().toISOString() } : p
          ),
        }))
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
