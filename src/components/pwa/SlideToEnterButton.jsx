import { useState, useRef, useEffect, useCallback } from 'react'

const THUMB_SIZE = 52
const UMBRAL = 0.82

export default function SlideToEnterButton({ texto = 'Desliza para entrar', onEntrar }) {
  const [x, setX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [completado, setCompletado] = useState(false)
  const containerRef = useRef(null)
  const dragging = useRef(false)
  const startClientX = useRef(0)
  const startX = useRef(0)
  const maxXRef = useRef(200)

  const updateMaxX = useCallback(() => {
    if (containerRef.current) {
      maxXRef.current = containerRef.current.offsetWidth - THUMB_SIZE - 8
    }
  }, [])

  useEffect(() => {
    updateMaxX()
    window.addEventListener('resize', updateMaxX)
    return () => window.removeEventListener('resize', updateMaxX)
  }, [updateMaxX])

  const progress = maxXRef.current > 0 ? x / maxXRef.current : 0

  function onPointerDown(e) {
    if (completado) return
    e.preventDefault()
    dragging.current = true
    startClientX.current = e.clientX
    startX.current = x
    setIsDragging(true)
    updateMaxX()
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function onPointerMove(e) {
    if (!dragging.current) return
    const delta = e.clientX - startClientX.current
    const newX = Math.max(0, Math.min(startX.current + delta, maxXRef.current))
    setX(newX)
  }

  function onPointerUp() {
    if (!dragging.current) return
    dragging.current = false
    setIsDragging(false)
    if (progress >= UMBRAL) {
      setCompletado(true)
      setX(maxXRef.current)
      setTimeout(onEntrar, 350)
    } else {
      setX(0)
    }
  }

  const textOpacity = Math.max(0, 1 - progress * 2.2)

  return (
    <div
      ref={containerRef}
      className="relative h-[56px] rounded-full overflow-hidden select-none touch-none"
      style={{
        background: 'rgba(255,255,255,0.12)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.20)',
      }}
    >
      {/* Progress fill */}
      <div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{
          width: `${x + THUMB_SIZE + 4}px`,
          background: 'linear-gradient(90deg, rgba(201,169,110,0.35), rgba(201,169,110,0.15))',
          transition: isDragging ? 'none' : 'width 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      />

      {/* Label + chevrons */}
      <div
        className="absolute inset-0 flex items-center justify-center gap-1.5 pointer-events-none"
        style={{ opacity: textOpacity, transition: 'opacity 0.1s' }}
      >
        <span className="text-white/85 text-sm font-medium tracking-wide pl-10">{texto}</span>
        <span className="text-white/60 text-base pwa-chevron" style={{ animationDelay: '0s' }}>›</span>
        <span className="text-white/40 text-base pwa-chevron" style={{ animationDelay: '0.15s' }}>›</span>
        <span className="text-white/20 text-base pwa-chevron" style={{ animationDelay: '0.30s' }}>›</span>
      </div>

      {/* "Entrando" label */}
      {completado && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-white text-sm font-semibold tracking-widest">Entrando…</span>
        </div>
      )}

      {/* Thumb */}
      <div
        className="absolute top-[4px] left-[4px] rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
        style={{
          width: THUMB_SIZE,
          height: THUMB_SIZE - 8,
          background: completado
            ? 'linear-gradient(135deg, #C9A96E, #9B7B5B)'
            : 'rgba(255,255,255,0.95)',
          transform: `translateX(${x}px)`,
          transition: isDragging
            ? 'none'
            : 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), background 0.3s',
          boxShadow: '0 2px 16px rgba(0,0,0,0.25)',
          animation: !isDragging && !completado && x === 0 ? 'pwaThumbHint 2.2s ease-in-out 1.5s infinite' : 'none',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {completado ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9B7B5B" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        )}
      </div>
    </div>
  )
}
