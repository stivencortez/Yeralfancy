import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { fotoCapa, posicionCapa } from '../utils/imagen'

export const useCarrito = create(
  persist(
    (set, get) => ({
      items: [],

      agregarAlCarrito: (producto, cantidad = 1) => {
        set(s => {
          const existe = s.items.find(i => i.productoId === producto.id)
          if (existe) {
            return {
              items: s.items.map(i =>
                i.productoId === producto.id
                  ? { ...i, cantidad: Math.min(i.cantidad + cantidad, producto.stock) }
                  : i
              ),
            }
          }
          return {
            items: [...s.items, {
              productoId: producto.id,
              nombre: producto.nombre,
              precioVenta: producto.precioVenta,
              precioCosto: producto.precioCosto,
              categoriaId: producto.categoriaId || null,
              cantidad,
              foto: fotoCapa(producto) || null,
              posicion: posicionCapa(producto.capa) || null,
              stock: producto.stock,
            }],
          }
        })
      },

      quitarDelCarrito: (productoId) => {
        set(s => ({ items: s.items.filter(i => i.productoId !== productoId) }))
      },

      cambiarCantidad: (productoId, cantidad) => {
        if (cantidad <= 0) {
          get().quitarDelCarrito(productoId)
          return
        }
        set(s => ({
          items: s.items.map(i => i.productoId === productoId ? { ...i, cantidad } : i),
        }))
      },

      vaciarCarrito: () => set({ items: [] }),

      getTotalItems: () => get().items.reduce((acc, i) => acc + i.cantidad, 0),

      getTotal: () => get().items.reduce((acc, i) => acc + i.precioVenta * i.cantidad, 0),

      getCostoTotal: () => get().items.reduce((acc, i) => acc + (i.precioCosto || 0) * i.cantidad, 0),
    }),
    { name: 'yf-carrito' }
  )
)
