import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { isRunningAsPWA, isMobileDevice } from '../../hooks/usePWAStandalone'
import { usePWAIntro } from '../../store/usePWAIntro'
import PWAIntroScreen from './PWAIntroScreen'

const LS_SEEN = 'yeral_pwa_intro_seen'
const LS_LAST = 'yeral_pwa_intro_last_seen'

function debeVerificarLS(modoVisualizacion) {
  if (modoVisualizacion === 'primera_vez') {
    return !localStorage.getItem(LS_SEEN)
  }
  if (modoVisualizacion === 'una_vez_al_dia') {
    const ultima = localStorage.getItem(LS_LAST)
    return !ultima || ultima !== new Date().toDateString()
  }
  return true // 'siempre'
}

function marcarVista(modoVisualizacion) {
  if (modoVisualizacion === 'primera_vez') {
    localStorage.setItem(LS_SEEN, 'true')
  } else if (modoVisualizacion === 'una_vez_al_dia') {
    localStorage.setItem(LS_LAST, new Date().toDateString())
  }
}

export default function PWAIntroGate() {
  const config = usePWAIntro(s => s.config)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isRunningAsPWA()) return
    if (!isMobileDevice()) return
    if (!config.habilitado) return
    if (!debeVerificarLS(config.modoVisualizacion)) return
    setVisible(true)
  }, [])

  function handleEntrar() {
    marcarVista(config.modoVisualizacion)
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && <PWAIntroScreen key="pwa-intro" onEntrar={handleEntrar} />}
    </AnimatePresence>
  )
}
