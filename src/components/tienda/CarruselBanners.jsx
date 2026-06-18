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
    <div className="relative w-full overflow-hidden rounded-2xl lg:rounded-3xl" style={{ aspectRatio: '16/5' }}>
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
          <div className="absolute inset-0 hidden lg:flex flex-col justify-end p-8 bg-gradient-to-t from-black/40 via-transparent">
            {banner.titulo && (
              <h2 className="text-white font-display font-bold text-3xl xl:text-4xl drop-shadow-lg">{banner.titulo}</h2>
            )}
            {banner.subtitulo && (
              <p className="text-white/90 text-base mt-1 drop-shadow">{banner.subtitulo}</p>
            )}
          </div>
        )}
      </div>

      {bannersActivos.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); anterior() }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white transition-all"
          >
            <ChevronLeft size={18} className="text-marca-negro" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); siguiente() }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white transition-all"
          >
            <ChevronRight size={18} className="text-marca-negro" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {bannersActivos.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setIndice(i) }}
                className={`rounded-full transition-all duration-300 ${i === indice ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
