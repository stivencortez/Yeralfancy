import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { generarId } from '../utils/formatear'

const CONFIG_INICIAL = {
  habilitado: true,
  modoVisualizacion: 'siempre', // 'siempre' | 'primera_vez' | 'una_vez_al_dia'
}

function bannerDeDB(row) {
  return {
    id: row.id,
    imagen: row.imagen || '',
    titulo: row.titulo || '',
    subtitulo: row.subtitulo || '',
    botonTexto: row.boton_texto || 'Desliza para entrar',
    activo: row.activo !== false,
    orden: row.orden || 0,
    creadoEn: row.created_at,
  }
}

function bannerParaDB(obj) {
  return {
    id: obj.id,
    imagen: obj.imagen || '',
    titulo: obj.titulo || '',
    subtitulo: obj.subtitulo || '',
    boton_texto: obj.botonTexto || 'Desliza para entrar',
    activo: obj.activo !== false,
    orden: obj.orden || 0,
  }
}

export const usePWAIntro = create(
  persist(
    (set, get) => ({
      config: CONFIG_INICIAL,
      banners: [],

      sincronizarDesdeSupabase: async () => {
        try {
          const { data: cfg, error } = await supabase
            .from('pwa_intro_config')
            .select('*')
            .eq('id', 1)
            .single()
          if (!error && cfg) {
            set({ config: { habilitado: cfg.habilitado, modoVisualizacion: cfg.modo_visualizacion } })
          }
        } catch {}
        try {
          const { data: rows, error } = await supabase
            .from('pwa_intro_banners')
            .select('*')
            .order('orden')
          // Only replace local banners if Supabase returns real data (rows.length > 0)
          // This prevents wiping localStorage when tables don't exist or RLS blocks access
          if (!error && rows && rows.length > 0) {
            set({ banners: rows.map(bannerDeDB) })
          }
        } catch {}
      },

      actualizarConfig: async (datos) => {
        const siguiente = { ...get().config, ...datos }
        set({ config: siguiente })
        try {
          await supabase.from('pwa_intro_config').upsert({
            id: 1,
            habilitado: siguiente.habilitado,
            modo_visualizacion: siguiente.modoVisualizacion,
          })
        } catch {}
      },

      agregarBanner: async (datos) => {
        const nuevo = { ...datos, id: generarId(), creadoEn: new Date().toISOString() }
        set(s => ({ banners: [...s.banners, nuevo] }))
        const { error } = await supabase.from('pwa_intro_banners').insert(bannerParaDB(nuevo))
        if (error) console.warn('[PWAIntro] Supabase insert error:', error.message)
      },

      editarBanner: (id, datos) => {
        set(s => ({ banners: s.banners.map(b => b.id === id ? { ...b, ...datos } : b) }))
        const b = get().banners.find(x => x.id === id)
        if (b) supabase.from('pwa_intro_banners').update(bannerParaDB(b)).eq('id', id).catch((e) => console.warn('[PWAIntro] Supabase update error:', e))
      },

      eliminarBanner: (id) => {
        set(s => ({ banners: s.banners.filter(b => b.id !== id) }))
        supabase.from('pwa_intro_banners').delete().eq('id', id).catch(() => {})
      },

      toggleActivo: (id) => {
        set(s => ({ banners: s.banners.map(b => b.id === id ? { ...b, activo: !b.activo } : b) }))
        const b = get().banners.find(x => x.id === id)
        if (b) supabase.from('pwa_intro_banners').update({ activo: b.activo }).eq('id', id).catch(() => {})
      },

      getBannersActivos: () =>
        [...get().banners.filter(b => b.activo)].sort((a, b) => a.orden - b.orden),
    }),
    { name: 'yf-pwa-intro' }
  )
)
