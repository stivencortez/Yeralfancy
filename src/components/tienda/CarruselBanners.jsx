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
    <>
      {/* ── Mobile banner: imagen completa, sin recortes ── */}
      <div
        className="relative w-full overflow-hidden rounded-2xl shadow-banner cursor-pointer bg-marca-beige lg:hidden"
        style={{ aspectRatio: '16/5' }}
        onClick={() => banner.enlace && navigate(banner.enlace)}
      >
        <img
          src={banner.imagen}
          alt={banner.titulo || 'Banner'}
          className="w-full h-full object-contain transition-all duration-500"
          loading="eager"
        />
        {/* Overlay gradiente siempre visible en mobile */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />

        {/* Texto sobre imagen */}
        {(banner.titulo || banner.subtitulo) && (
          <div className="absolute bottom-0 left-0 right-0 p-3">
            {banner.subtitulo && (
              <p className="text-white/85 text-[10px] font-medium uppercase tracking-widest mb-0.5 line-clamp-1">{banner.subtitulo}</p>
            )}
            {banner.titulo && (
              <h2 className="text-white font-bold text-sm leading-tight drop-shadow-sm line-clamp-1">{banner.titulo}</h2>
            )}
            {banner.enlace && (
              <span className="inline-block mt-1.5 bg-white text-marca-negro text-[10px] font-semibold px-3 py-1 rounded-full">
                Ver colección
              </span>
            )}
          </div>
        )}

        {/* Indicadores de carrusel */}
        {bannersActivos.length > 1 && (
          <div className="absolute top-4 right-4 flex gap-1.5">
            {bannersActivos.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setIndice(i) }}
                className={`rounded-full transition-all duration-300 ${i === indice ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/50'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Desktop banner: proporciones originales 16:5 ── */}
      <div
        className="relative w-full overflow-hidden rounded-3xl hidden lg:block"
        style={{ aspectRatio: '16/5' }}
      >
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
            <div className="absolute inset-0 flex flex-col justify-end p-8 bg-gradient-to-t from-black/40 via-transparent">
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
    </>
  )
}
