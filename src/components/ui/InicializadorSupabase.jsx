import { useEffect } from 'react'
import { useProductos } from '../../store/useProductos'
import { useCategorias } from '../../store/useCategorias'
import { usePedidos } from '../../store/usePedidos'
import { useClientes } from '../../store/useClientes'
import { useBanners } from '../../store/useBanners'
import { useConfig } from '../../store/useConfig'
import { useAuth } from '../../store/useAuth'
import { usePWAIntro } from '../../store/usePWAIntro'
import { supabase } from '../../lib/supabase'

const CLEANUP_KEY = 'yf-cleanup-ficticios-v1'

const IDS_PRODUCTOS_FICTICIOS = ['prod1', 'prod2', 'prod3', 'prod4', 'prod5', 'prod6', 'prod7', 'prod8']
const IDS_BANNERS_FICTICIOS   = ['ban1', 'ban2']

export default function InicializadorSupabase() {
  const sincProductos  = useProductos(s => s.sincronizarDesdeSupabase)
  const sincCategorias = useCategorias(s => s.sincronizarDesdeSupabase)
  const sincPedidos    = usePedidos(s => s.sincronizarDesdeSupabase)
  const sincClientes   = useClientes(s => s.sincronizarDesdeSupabase)
  const sincBanners    = useBanners(s => s.sincronizarDesdeSupabase)
  const sincConfig     = useConfig(s => s.sincronizarDesdeSupabase)
  const sincAuth       = useAuth(s => s.sincronizarDesdeSupabase)
  const sincPWAIntro   = usePWAIntro(s => s.sincronizarDesdeSupabase)

  useEffect(() => {
    const inicializar = async () => {
      if (!localStorage.getItem(CLEANUP_KEY)) {
        // Eliminar datos ficticios del Supabase (solo corre una vez)
        await Promise.allSettled([
          supabase.from('productos').delete().in('id', IDS_PRODUCTOS_FICTICIOS),
          supabase.from('banners').delete().in('id', IDS_BANNERS_FICTICIOS),
          supabase.from('categorias').update({ imagen: '' }).like('imagen', '%picsum.photos%'),
        ])
        // Limpiar localStorage obsoleto con dados ficticios
        localStorage.removeItem('yf-productos')
        localStorage.removeItem('yf-banners')
        localStorage.setItem(CLEANUP_KEY, '1')
      }

      // Sincronizar todos os stores com o Supabase
      await Promise.allSettled([
        sincCategorias(),
        sincProductos(),
        sincBanners(),
        sincConfig(),
        sincAuth(),
        sincPWAIntro(),
      ])
      sincPedidos()
      sincClientes()
    }

    inicializar()
  }, [])

  return null
}
