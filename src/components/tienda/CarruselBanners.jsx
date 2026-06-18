import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBanners } from '../../store/useBanners'

export function CarruselBanners() {
  const bannersActivos = useBanners(s => s.getActivos())
  const [indice, setIndice] = useState(0)
  const navigate = useNavigate()

  const siguiente = useCallback(() => {
    setIndice(i => (i + 1) % bannersActivos.length)
  }, [bannersActivos.length])

  useEffect(() => {
    if (bannersActivos.length <= 1) return
    const timer = setInterval(siguiente, 4000)
    return () => clearInterval(timer)
  }, [siguiente, bannersActivos.length])

  if (bannersActivos.length === 0) return null

  const banner = bannersActivos[indice]

  return (
    <div className="relative w-full overflow-hidden rounded-2xl" style={{ aspectRatio: '16/5' }}>
      <div
        className="w-full h-full cursor-pointer"
        onClick={() => banner.enlace && navigate(banner.enlace)}
      >
        <img
          src={banner.imagen}
          alt={banner.titulo || 'Banner'}
          className="w-full h-full object-cover transition-all duration-500"
          loading="eager"
        />
      </div>
    </div>
  )
}
