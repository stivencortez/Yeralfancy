import { useState, useRef } from 'react'
import { Save, Store, Share2, Lock, Image as ImageIcon, Upload, Check, Eye, EyeOff } from 'lucide-react'
import { useConfig } from '../../store/useConfig'
import { useAuth } from '../../store/useAuth'
import { useAdminToast } from '../../layouts/LayoutAdmin'
import { subirImagenLogo } from '../../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

const TABS = [
  { id: 'tienda', label: 'Tienda', icono: Store },
  { id: 'logos', label: 'Logos', icono: ImageIcon },
  { id: 'redes', label: 'Redes', icono: Share2 },
  { id: 'seguridad', label: 'Seguridad', icono: Lock },
]

const LOGOS_PREDETERMINADOS = [
  { id: 'l1', src: '/logos/IMG_5723.PNG', nombre: 'Logo A' },
  { id: 'l2', src: '/logos/IMG_5720.PNG', nombre: 'Logo B' },
  { id: 'l3', src: '/logos/IMG_5722.PNG', nombre: 'Logo C' },
  { id: 'l4', src: '/logos/IMG_6107.PNG', nombre: 'Logo D' },
]

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
}
const pageTransition = { duration: 0.18, ease: 'easeOut' }

function SeccionHeader({ icono: Icono, titulo, subtitulo }) {
  return (
    <div className="flex items-center gap-3 pb-4 border-b border-marca-beige-borde mb-5">
      <div className="w-9 h-9 bg-marca-beige rounded-xl flex items-center justify-center shrink-0">
        <Icono size={17} className="text-marca-marron" />
      </div>
      <div>
        <h2 className="font-semibold text-marca-negro text-sm">{titulo}</h2>
        <p className="text-xs text-marca-texto-suave">{subtitulo}</p>
      </div>
    </div>
  )
}

function BotonGuardar({ onClick, cargando }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={cargando}
      whileTap={{ scale: 0.98 }}
      className="btn-primario w-full py-3.5 flex items-center justify-center gap-2 mt-5 disabled:opacity-60"
    >
      {cargando ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Guardando...
        </>
      ) : (
        <>
          <Save size={16} />
          Guardar cambios
        </>
      )}
    </motion.button>
  )
}

export default function Configuracion() {
  const config = useConfig(s => s.config)
  const actualizarConfig = useConfig(s => s.actualizarConfig)
  const cambiarContrasena = useAuth(s => s.cambiarContrasena)
  const credenciales = useAuth(s => s.credenciales)
  const toast = useAdminToast()

  const [tabActivo, setTabActivo] = useState('tienda')
  const [datos, setDatos] = useState({ ...config })
  const [pass, setPass] = useState({ actual: '', nueva: '', confirmar: '' })
  const [verPass, setVerPass] = useState({ actual: false, nueva: false, confirmar: false })
  const [guardando, setGuardando] = useState(false)
  const [subiendoLogo, setSubiendoLogo] = useState(false)
  const inputLogoRef = useRef(null)

  const guardarConfig = async () => {
    setGuardando(true)
    await new Promise(r => setTimeout(r, 350))
    actualizarConfig(datos)
    setGuardando(false)
    toast('Configuración guardada correctamente', 'exito')
  }

  const cambiarPass = () => {
    if (pass.actual !== credenciales.contrasena) { toast('Contraseña actual incorrecta', 'error'); return }
    if (pass.nueva.length < 6) { toast('La contraseña debe tener mínimo 6 caracteres', 'error'); return }
    if (pass.nueva !== pass.confirmar) { toast('Las contraseñas no coinciden', 'error'); return }
    cambiarContrasena(pass.nueva)
    setPass({ actual: '', nueva: '', confirmar: '' })
    toast('Contraseña cambiada correctamente', 'exito')
  }

  const handleSubirLogo = async (e) => {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    if (!archivo.type.startsWith('image/')) { toast('Solo se permiten imágenes', 'error'); return }
    setSubiendoLogo(true)
    try {
      const url = await subirImagenLogo(archivo)
      setDatos(d => ({ ...d, logo: url }))
      toast('Logo subido correctamente', 'exito')
    } catch (err) {
      toast('Error al subir: ' + err.message, 'error')
    } finally {
      setSubiendoLogo(false)
      if (inputLogoRef.current) inputLogoRef.current.value = ''
    }
  }

  const campo = (key) => ({
    value: datos[key] ?? '',
    onChange: (e) => setDatos(d => ({ ...d, [key]: e.target.value })),
  })

  const inputPass = (key, visible) => ({
    type: visible ? 'text' : 'password',
    value: pass[key],
    onChange: (e) => setPass(p => ({ ...p, [key]: e.target.value })),
    className: 'input-campo pr-11',
  })

  return (
    <div className="animate-fade-in max-w-xl">
      {/* Page title */}
      <div className="mb-6">
        <h1 className="font-bold text-xl text-marca-negro">Configuración</h1>
        <p className="text-sm text-marca-texto-suave mt-1">Gestiona la información y preferencias de tu tienda</p>
      </div>

      {/* Tab bar */}
      <div className="bg-marca-beige rounded-2xl p-1 flex gap-1 mb-6">
        {TABS.map(({ id, label, icono: Icono }) => (
          <button
            key={id}
            onClick={() => setTabActivo(id)}
            className={`relative flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-sm font-medium transition-all duration-200
              ${tabActivo === id ? 'text-marca-negro' : 'text-marca-texto-suave hover:text-marca-negro'}`}
          >
            {tabActivo === id && (
              <motion.span
                layoutId="tabBg"
                className="absolute inset-0 bg-white rounded-xl shadow-tarjeta"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              <Icono size={14} />
              <span className="hidden sm:inline">{label}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">

        {/* ── Tienda ── */}
        {tabActivo === 'tienda' && (
          <motion.div key="tienda" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
            <div className="bg-white rounded-2xl shadow-tarjeta p-5">
              <SeccionHeader icono={Store} titulo="Información de la tienda" subtitulo="Datos públicos de tu negocio" />
              <div className="space-y-4">
                <div>
                  <label className="etiqueta">Nombre de la tienda</label>
                  <input {...campo('nombre')} className="input-campo" />
                </div>
                <div>
                  <label className="etiqueta">Descripción</label>
                  <textarea {...campo('descripcion')} className="input-campo resize-none" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="etiqueta">Email</label>
                    <input type="email" {...campo('email')} className="input-campo" />
                  </div>
                  <div>
                    <label className="etiqueta">WhatsApp</label>
                    <input {...campo('whatsapp')} className="input-campo" />
                  </div>
                </div>
                <div>
                  <label className="etiqueta">Horario de atención</label>
                  <input {...campo('horario')} className="input-campo" placeholder="Lunes a Sábado: 9:00 AM – 7:00 PM" />
                </div>
                <div>
                  <label className="etiqueta">Dirección (opcional)</label>
                  <input {...campo('direccion')} className="input-campo" />
                </div>
              </div>
            </div>
            <BotonGuardar onClick={guardarConfig} cargando={guardando} />
          </motion.div>
        )}

        {/* ── Logos ── */}
        {tabActivo === 'logos' && (
          <motion.div key="logos" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition} className="space-y-4">
            <div className="bg-white rounded-2xl shadow-tarjeta p-5">
              <SeccionHeader icono={ImageIcon} titulo="Identidad visual" subtitulo="Logo que aparece en la tienda y en este panel" />

              {/* Preview + upload */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-28 h-28 rounded-2xl bg-marca-beige-suave border-2 border-marca-beige-borde flex items-center justify-center overflow-hidden shrink-0">
                  {datos.logo ? (
                    <img src={datos.logo} alt="Logo actual" className="w-full h-full object-contain p-3" />
                  ) : (
                    <ImageIcon size={28} className="text-marca-beige-borde" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-marca-negro">Logo actual</p>
                  <p className="text-xs text-marca-texto-suave mt-1 break-all leading-relaxed">
                    {datos.logo ? datos.logo.replace(/.*\/logos\//, '/logos/') : 'Ningún logo seleccionado'}
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => inputLogoRef.current?.click()}
                    disabled={subiendoLogo}
                    className="mt-3 inline-flex items-center gap-1.5 bg-marca-beige text-marca-marron-oscuro text-xs font-semibold px-3.5 py-2 rounded-xl hover:bg-marca-beige-borde transition-colors disabled:opacity-60"
                  >
                    {subiendoLogo ? (
                      <div className="w-3 h-3 border border-marca-marron/30 border-t-marca-marron rounded-full animate-spin" />
                    ) : (
                      <Upload size={13} />
                    )}
                    {subiendoLogo ? 'Subiendo...' : 'Subir imagen'}
                  </motion.button>
                  <input
                    ref={inputLogoRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleSubirLogo}
                  />
                </div>
              </div>

              {/* Logos preestablecidos */}
              <div>
                <p className="text-xs font-semibold text-marca-texto-suave uppercase tracking-wider mb-3">Logos disponibles</p>
                <div className="grid grid-cols-4 gap-3">
                  {LOGOS_PREDETERMINADOS.map(logo => {
                    const activo = datos.logo === logo.src
                    return (
                      <motion.button
                        key={logo.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setDatos(d => ({ ...d, logo: logo.src }))}
                        className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-colors duration-200 bg-marca-beige-suave p-2
                          ${activo
                            ? 'border-marca-marron ring-2 ring-marca-marron/20'
                            : 'border-marca-beige-borde hover:border-marca-marron/50'
                          }`}
                      >
                        <img src={logo.src} alt={logo.nombre} className="w-full h-full object-contain" />
                        {activo && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-1.5 right-1.5 w-5 h-5 bg-marca-marron rounded-full flex items-center justify-center"
                          >
                            <Check size={11} className="text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
                <p className="text-xs text-marca-texto-suave mt-3">Selecciona un logo preestablecido o sube uno personalizado desde tu dispositivo.</p>
              </div>

              {/* URL personalizada */}
              <div className="mt-5 pt-4 border-t border-marca-beige-borde">
                <label className="etiqueta">O introduce una URL de imagen</label>
                <input
                  {...campo('logo')}
                  className="input-campo"
                  placeholder="https://mi-dominio.com/logo.png"
                />
              </div>
            </div>

            <BotonGuardar onClick={guardarConfig} cargando={guardando} />
          </motion.div>
        )}

        {/* ── Redes ── */}
        {tabActivo === 'redes' && (
          <motion.div key="redes" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
            <div className="bg-white rounded-2xl shadow-tarjeta p-5">
              <SeccionHeader icono={Share2} titulo="Redes sociales" subtitulo="URLs completos de tus perfiles" />
              <div className="space-y-4">
                <div>
                  <label className="etiqueta">Instagram</label>
                  <input {...campo('instagram')} className="input-campo" placeholder="https://www.instagram.com/..." />
                </div>
                <div>
                  <label className="etiqueta">TikTok</label>
                  <input {...campo('tiktok')} className="input-campo" placeholder="https://www.tiktok.com/@..." />
                </div>
              </div>
            </div>
            <BotonGuardar onClick={guardarConfig} cargando={guardando} />
          </motion.div>
        )}

        {/* ── Seguridad ── */}
        {tabActivo === 'seguridad' && (
          <motion.div key="seguridad" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
            <div className="bg-white rounded-2xl shadow-tarjeta p-5">
              <SeccionHeader icono={Lock} titulo="Cambiar contraseña" subtitulo="Actualiza tu contraseña de acceso al panel" />
              <div className="space-y-4">
                {[
                  { key: 'actual', label: 'Contraseña actual' },
                  { key: 'nueva', label: 'Nueva contraseña' },
                  { key: 'confirmar', label: 'Confirmar nueva contraseña' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="etiqueta">{label}</label>
                    <div className="relative">
                      <input {...inputPass(key, verPass[key])} />
                      <button
                        type="button"
                        onClick={() => setVerPass(v => ({ ...v, [key]: !v[key] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-marca-texto-suave hover:text-marca-negro transition-colors"
                      >
                        {verPass[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={cambiarPass}
              className="btn-outline w-full py-3.5 flex items-center justify-center gap-2 mt-5"
            >
              <Lock size={16} />
              Cambiar contraseña
            </motion.button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
