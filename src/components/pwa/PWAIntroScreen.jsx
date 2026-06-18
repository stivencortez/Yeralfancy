import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { usePWAIntro } from '../../store/usePWAIntro'
import { useConfig } from '../../store/useConfig'
import SlideToEnterButton from './SlideToEnterButton'

const BANNER_FALLBACK = {
  imagen: '',
  botonTexto: 'Desliza para entrar',
  corHint: '#ffffff',
}

export default function PWAIntroScreen({ onEntrar }) {
  const getBannersActivos = usePWAIntro(s => s.getBannersActivos)
  const config = useConfig(s => s.config)
  const banners = getBannersActivos()
  const [indice, setIndice] = useState(0)

  const banner = banners.length > 0 ? banners[indice] : BANNER_FALLBACK
  const hayBanners = banners.length > 0
  const touchStartX = useRef(null)

  const siguiente = useCallback(() => setIndice(i => (i + 1) % banners.length), [banners.length])
  const anterior = useCallback(() => setIndice(i => (i - 1 + banners.length) % banners.length), [banners.length])

  // Auto-rotate cada 3 segundos
  useEffect(() => {
    if (banners.length <= 1) return
    const id = setInterval(siguiente, 3000)
    return () => clearInterval(id)
  }, [siguiente, banners.length])

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || banners.length <= 1) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) diff > 0 ? siguiente() : anterior()
    touchStartX.current = null
  }

  return (
    <motion.div
      className="fixed inset-0 z-[9999] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.45, ease: [0.43, 0.13, 0.23, 0.96] }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Fondo ── */}
      {banner.imagen ? (
        <motion.img
          key={banner.imagen}
          src={banner.imagen}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: 7, ease: 'linear' }}
          draggable={false}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(160deg, #1C1C1C 0%, #3D2B1A 55%, #7A5C3A 100%)' }}
        />
      )}

      {/* ── Degradados superpuestos ── */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.42) 0%, transparent 38%, transparent 42%, rgba(0,0,0,0.82) 100%)',
        }}
      />

      {/* ── Contenido principal ── */}
      <div
        className="relative z-10 flex flex-col"
        style={{
          height: '100dvh',
          paddingTop: 'max(env(safe-area-inset-top, 0px), 20px)',
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 20px)',
        }}
      >
        {/* Logo */}
        <motion.div
          className="flex items-center justify-center px-6 pt-4"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15 }}
        >
          {config.logo ? (
            <img
              src={config.logo}
              alt={config.nombre}
              className="h-11 max-w-[160px] object-contain"
              style={{ filter: 'brightness(0) invert(1)', opacity: 0.92 }}
              draggable={false}
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(201,169,110,0.22)', border: '1px solid rgba(201,169,110,0.45)' }}
              >
                <span className="text-white font-bold text-xl font-display select-none">YF</span>
              </div>
              <span className="text-white/90 text-sm font-display font-semibold tracking-[0.18em] uppercase select-none">
                {config.nombre || 'Yeral fancy'}
              </span>
            </div>
          )}
        </motion.div>

        {/* Espacio central */}
        <div className="flex-1" />

        {/* Sección inferior */}
        <div className="px-6 pb-4 space-y-5">
          {/* Dots de banners */}
          {hayBanners && banners.length > 1 && (
            <div className="flex items-center justify-center gap-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndice(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === indice ? 22 : 6,
                    height: 6,
                    background: i === indice ? 'rgba(201,169,110,0.90)' : 'rgba(255,255,255,0.35)',
                  }}
                />
              ))}
            </div>
          )}

          {/* Hint animado */}
          <motion.p
            className="text-xs text-center tracking-widest uppercase select-none"
            style={{ color: banner.corHint || '#ffffff', opacity: 0.7 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Desliza para descubrir
          </motion.p>

          {/* Botón deslizante */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            <SlideToEnterButton
              texto={banner.botonTexto || 'Desliza para entrar'}
              onEntrar={onEntrar}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
