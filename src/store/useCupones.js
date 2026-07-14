import { create } from 'zustand'
import { supabase, cuponDeDB, cuponParaDB } from '../lib/supabase'
import { generarId } from '../utils/formatear'

export const useCupones = create((set, get) => ({
  cupones: [],

  sincronizarDesdeSupabase: async () => {
    try {
      const { data, error } = await supabase
        .from('cupones')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) { console.warn('Supabase cupones:', error.message); return }
      if (data) set({ cupones: data.map(cuponDeDB) })
    } catch (e) {
      console.warn('Error sync cupones:', e)
    }
  },

  agregarCupon: async (datos) => {
    const nuevo = { ...cuponParaDB(datos), id: generarId() }
    const { error } = await supabase.from('cupones').insert(nuevo)
    if (error) throw new Error(error.message)
    set(s => ({ cupones: [cuponDeDB({ ...nuevo, created_at: new Date().toISOString() }), ...s.cupones] }))
  },

  editarCupon: async (id, datos) => {
    const actualizado = cuponParaDB({ ...datos, id })
    const { error } = await supabase.from('cupones').update(actualizado).eq('id', id)
    if (error) throw new Error(error.message)
    set(s => ({
      cupones: s.cupones.map(c =>
        c.id === id ? { ...cuponDeDB({ ...actualizado, created_at: c.creadoEn }) } : c
      ),
    }))
  },

  eliminarCupon: async (id) => {
    const { error } = await supabase.from('cupones').delete().eq('id', id)
    if (error) throw new Error(error.message)
    set(s => ({ cupones: s.cupones.filter(c => c.id !== id) }))
  },

  validarCodigo: (codigo) => {
    const ahora = new Date()
    ahora.setHours(0, 0, 0, 0)
    return get().cupones.find(c =>
      c.codigo === codigo.toUpperCase().trim() &&
      c.activo &&
      (!c.fechaExpiracion || new Date(c.fechaExpiracion) >= ahora) &&
      (c.usosMaximos === null || c.usosActuales < c.usosMaximos)
    ) || null
  },

  registrarUso: async (id) => {
    const cupon = get().cupones.find(c => c.id === id)
    if (!cupon) return
    const nuevosUsos = cupon.usosActuales + 1
    await supabase.from('cupones').update({ usos_actuales: nuevosUsos }).eq('id', id)
    set(s => ({ cupones: s.cupones.map(c => c.id === id ? { ...c, usosActuales: nuevosUsos } : c) }))
  },
}))

export function calcularDescuento(cupon, items) {
  if (!cupon) return 0

  let base = 0
  if (cupon.alcance === 'todo') {
    base = items.reduce((a, i) => a + i.precioVenta * i.cantidad, 0)
  } else if (cupon.alcance === 'categoria') {
    base = items
      .filter(i => i.categoriaId === cupon.categoriaId)
      .reduce((a, i) => a + i.precioVenta * i.cantidad, 0)
  } else if (cupon.alcance === 'producto') {
    base = items
      .filter(i => i.productoId === cupon.productoId)
      .reduce((a, i) => a + i.precioVenta * i.cantidad, 0)
  }

  if (base === 0) return 0
  return cupon.tipo === 'porcentaje'
    ? Math.round((base * cupon.valor / 100) * 100) / 100
    : Math.min(cupon.valor, base)
}
