export function isRunningAsPWA() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

export function isMobileDevice() {
  if (typeof window === 'undefined') return false
  const ua = navigator.userAgent
  if (/Android|iPhone|iPod/i.test(ua)) return true
  if (/iPad/i.test(ua)) return true
  // iPad on iOS 13+ reports as Macintosh
  if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return true
  return false
}
