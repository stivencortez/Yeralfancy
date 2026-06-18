import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useBanners } from '../../store/useBanners'

export function CarruselBanners() {
  const bannersActivos = useBanners(s => s.getActivos())
  const [indice, setIndice] = useState(0)
  const navigate = useNavigate()

  const siguiente = useCallback(() => {
    setIndice(i => (i + 1) % bannersActivos.length)
  }, [bannersActivos.length])

  const anterior = () => {
    setIndice(i => (i - 1 + bannersActivos.length) % bannersActivos.length)
  }

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
        {(banner.titulo || banner.subtitulo) && (
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent flex items-center">
            <div className="px-5 max-w-[60%]">
              {banner.titulo && (
                <h2 className="text-white font-bold text-lg leading-tight font-display">{banner.titulo}</h2>
              )}
              {banner.subtitulo && (
                <p className="text-white/80 text-xs mt-1">{banner.subtitulo}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {bannersActivos.length > 1 && (
        <>
          <button
            onClick={anterior}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center shadow"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={siguiente}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center shadow"
          >
            <ChevronRight size={14} />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {bannersActivos.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndice(i)}
                className={`h-1.5 rounded-full transition-all ${i === indice ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
