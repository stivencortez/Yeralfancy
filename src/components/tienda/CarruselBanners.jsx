import { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useBanners } from '../../store/useBanners'

export function CarruselBanners() {
  const bannersActivos = useBanners(s => s.getActivos())
  const [indice, setIndice] = useState(0)
  const navigate = useNavigate()
  const touchStartX = useRef(null)

  const siguiente = useCallback(() => {
    setIndice(i => (i + 1) % bannersActivos.length)
  }, [bannersActivos.length])

  const anterior = useCallback(() => {
    setIndice(i => (i - 1 + bannersActivos.length) % bannersActivos.length)
  }, [bannersActivos.length])

  useEffect(() => {
    if (bannersActivos.length <= 1) return
    const timer = setInterval(siguiente, 4000)
    return () => clearInterval(timer)
  }, [siguiente, bannersActivos.length])

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) {
      diff > 0 ? siguiente() : anterior()
    }
    touchStartX.current = null
  }

  if (bannersActivos.length === 0) return null

  const banner = bannersActivos[indice]

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl shadow-banner cursor-pointer bg-marca-beige"
      style={{ aspectRatio: '21/9' }}
      onClick={() => banner.enlace && navigate(banner.enlace)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <img
        key={banner.imagen}
        src={banner.imagen}
        alt={banner.titulo || 'Banner'}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
        loading="eager"
        draggable={false}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

      {/* Texto */}
      {(banner.titulo || banner.subtitulo) && (
        <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-7">
          {banner.subtitulo && (
            <p className="text-white/85 text-[10px] lg:text-sm font-medium uppercase tracking-widest mb-0.5 line-clamp-1">{banner.subtitulo}</p>
          )}
          {banner.titulo && (
            <h2 className="text-white font-bold text-sm lg:text-3xl leading-tight drop-shadow-sm line-clamp-1">{banner.titulo}</h2>
          )}
          {banner.enlace && (
            <span className="inline-block mt-1.5 bg-white text-marca-negro text-[10px] lg:text-sm font-semibold px-3 py-1 rounded-full">
              Ver colección
            </span>
          )}
        </div>
      )}

      {/* Dots */}
      {bannersActivos.length > 1 && (
        <div className="absolute top-3 right-3 lg:bottom-3 lg:top-auto lg:left-1/2 lg:-translate-x-1/2 lg:right-auto flex gap-1.5">
          {bannersActivos.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setIndice(i) }}
              className={`rounded-full transition-all duration-300 ${i === indice ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/50'}`}
            />
          ))}
        </div>
      )}

      {/* Setas desktop */}
      {bannersActivos.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); anterior() }}
            className="hidden lg:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full items-center justify-center shadow hover:bg-white transition-all"
          >
            <ChevronLeft size={18} className="text-marca-negro" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); siguiente() }}
            className="hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full items-center justify-center shadow hover:bg-white transition-all"
          >
            <ChevronRight size={18} className="text-marca-negro" />
          </button>
        </>
      )}
    </div>
  )
}
