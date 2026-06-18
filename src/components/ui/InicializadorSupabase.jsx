import { useEffect } from 'react'
import { useProductos } from '../../store/useProductos'
import { useCategorias } from '../../store/useCategorias'
import { usePedidos } from '../../store/usePedidos'
import { useClientes } from '../../store/useClientes'
import { useBanners } from '../../store/useBanners'
import { useConfig } from '../../store/useConfig'
import { useAuth } from '../../store/useAuth'

export default function InicializadorSupabase() {
  const sincProductos = useProductos(s => s.sincronizarDesdeSupabase)
  const sincCategorias = useCategorias(s => s.sincronizarDesdeSupabase)
  const sincPedidos = usePedidos(s => s.sincronizarDesdeSupabase)
  const sincClientes = useClientes(s => s.sincronizarDesdeSupabase)
  const sincBanners = useBanners(s => s.sincronizarDesdeSupabase)
  const sincConfig = useConfig(s => s.sincronizarDesdeSupabase)
  const sincAuth = useAuth(s => s.sincronizarDesdeSupabase)

  useEffect(() => {
    // Datos críticos para UI inicial
    sincCategorias()
    sincProductos()
    sincBanners()
    sincConfig()
    sincAuth()
    // Datos secundarios en background
    sincPedidos()
    sincClientes()
  }, [])

  return null
}
