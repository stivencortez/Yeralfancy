import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { usePWAIntro } from '../../store/usePWAIntro'
import { useConfig } from '../../store/useConfig'
import SlideToEnterButton from './SlideToEnterButton'

const BANNER_FALLBACK = {
  imagen: '',
  titulo: 'Bienvenida a Yeral fancy',
  subtitulo: 'Accesorios elegantes para cada ocasión.',
  botonTexto: 'Desliza para entrar',
}

export default function PWAIntroScreen({ onEntrar }) {
  const getBannersActivos = usePWAIntro(s => s.getBannersActivos)
  const config = useConfig(s => s.config)
  const banners = getBannersActivos()
  const [indice, setIndice] = useState(0)

  const banner = banners.length > 0 ? banners[indice] : BANNER_FALLBACK
  const hayBanners = banners.length > 0

  // Auto-rotate si hay más de un banner
  useEffect(() => {
    if (banners.length <= 1) return
    const id = setInterval(() => setIndice(i => (i + 1) % banners.length), 5000)
    return () => clearInterval(id)
  }, [banners.length])

  return (
    <motion.div
      className="fixed inset-0 z-[9999] overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.45, ease: [0.43, 0.13, 0.23, 0.96] }}
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

          {/* Textos del banner */}
          <motion.div
            key={`texto-${indice}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-2"
          >
            {banner.titulo && (
              <h1
                className="text-white font-display font-bold leading-tight"
                style={{ fontSize: 'clamp(1.35rem, 5.5vw, 1.85rem)' }}
              >
                {banner.titulo}
              </h1>
            )}
            {banner.subtitulo && (
              <p className="text-white/65 text-sm leading-relaxed">
                {banner.subtitulo}
              </p>
            )}
          </motion.div>

          {/* Hint animado */}
          <motion.p
            className="text-white/38 text-xs text-center tracking-widest uppercase select-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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
