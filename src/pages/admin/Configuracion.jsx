import { useState, useRef } from 'react'
import { Save, Store, Share2, Lock, Image as ImageIcon, Upload, Check, Eye, EyeOff, Moon, Trash2, AlertTriangle } from 'lucide-react'
import { useConfig } from '../../store/useConfig'
import { useAuth } from '../../store/useAuth'
import { useClientes } from '../../store/useClientes'
import { usePedidos } from '../../store/usePedidos'
import { useProductos } from '../../store/useProductos'
import { useCategorias } from '../../store/useCategorias'
import { useBanners } from '../../store/useBanners'
import { useAdminToast } from '../../layouts/LayoutAdmin'
import { subirImagenLogo } from '../../lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

const TABS = [
  { id: 'tienda',    label: 'Tienda',    icono: Store     },
  { id: 'logos',     label: 'Logos',     icono: ImageIcon },
  { id: 'redes',     label: 'Redes',     icono: Share2    },
  { id: 'seguridad', label: 'Seguridad', icono: Lock      },
  { id: 'reset',     label: 'Reset',     icono: Trash2    },
]

const LOGOS_PRE = [
  { id: 'l1', src: '/logos/IMG_5723.PNG', nombre: 'Logo A' },
  { id: 'l2', src: '/logos/IMG_5720.PNG', nombre: 'Logo B' },
  { id: 'l3', src: '/logos/IMG_5722.PNG', nombre: 'Logo C' },
  { id: 'l4', src: '/logos/IMG_6107.PNG', nombre: 'Logo D' },
]

const pageVariants  = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 } }
const pageTransition = { duration: 0.18, ease: 'easeOut' }

function SeccionHeader({ icono: Icono, titulo, subtitulo, iconoBg = 'bg-marca-beige' }) {
  return (
    <div className="flex items-center gap-3 pb-4 border-b border-marca-beige-borde mb-5">
      <div className={`w-9 h-9 ${iconoBg} rounded-xl flex items-center justify-center shrink-0`}>
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
        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Guardando...</>
      ) : (
        <><Save size={16} />Guardar cambios</>
      )}
    </motion.button>
  )
}

function GridLogos({ valor, onChange, fondo = 'bg-marca-beige-suave' }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {LOGOS_PRE.map(logo => {
        const activo = valor === logo.src
        return (
          <motion.button
            key={logo.id}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onChange(logo.src)}
            className={`relative aspect-square rounded-2xl border-2 transition-colors duration-200 p-2 ${fondo}
              ${activo ? 'border-marca-marron ring-2 ring-marca-marron/20' : 'border-marca-beige-borde hover:border-marca-marron/50'}`}
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
  )
}

export default function Configuracion() {
  const config          = useConfig(s => s.config)
  const actualizarConfig = useConfig(s => s.actualizarConfig)
  const cambiarContrasena = useAuth(s => s.cambiarContrasena)
  const credenciales    = useAuth(s => s.credenciales)
  const limpiarClientes = useClientes(s => s.limpiarClientes)
  const limpiarPedidos = usePedidos(s => s.limpiarPedidos)
  const limpiarProductos = useProductos(s => s.limpiarProductos)
  const limpiarCategorias = useCategorias(s => s.limpiarCategorias)
  const limpiarBanners = useBanners(s => s.limpiarBanners)
  const toast           = useAdminToast()

  const [tabActivo, setTabActivo] = useState('tienda')
  const [datos, setDatos]         = useState({ ...config })
  const [pass, setPass]           = useState({ actual: '', nueva: '', confirmar: '' })
  const [verPass, setVerPass]     = useState({ actual: false, nueva: false, confirmar: false })
  const [guardando, setGuardando] = useState(false)
  const [resetActivo, setResetActivo] = useState('')
  const [subiendoLogo, setSubiendoLogo]         = useState(false)
  const [subiendoLogoDark, setSubiendoLogoDark] = useState(false)
  const inputLogoRef     = useRef(null)
  const inputLogoDarkRef = useRef(null)

  const guardarConfig = async () => {
    setGuardando(true)
    try {
      const resultado = await actualizarConfig(datos)
      if (resultado?.guardadoParcial) {
        toast('Configuración guardada, pero falta crear logo_dark en Supabase', 'aviso')
      } else {
        toast('Configuración guardada correctamente', 'exito')
      }
    } catch (err) {
      toast('Error al guardar configuración: ' + err.message, 'error')
    } finally {
      setGuardando(false)
    }
  }

  const cambiarPass = () => {
    if (pass.actual !== credenciales.contrasena) { toast('Contraseña actual incorrecta', 'error'); return }
    if (pass.nueva.length < 6)                   { toast('Mínimo 6 caracteres', 'error'); return }
    if (pass.nueva !== pass.confirmar)            { toast('Las contraseñas no coinciden', 'error'); return }
    cambiarContrasena(pass.nueva)
    setPass({ actual: '', nueva: '', confirmar: '' })
    toast('Contraseña cambiada correctamente', 'exito')
  }

  const handleSubirLogo = async (e, campo) => {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    if (!archivo.type.startsWith('image/')) { toast('Solo imágenes permitidas', 'error'); return }
    const setSubiendo = campo === 'logo' ? setSubiendoLogo : setSubiendoLogoDark
    const ref         = campo === 'logo' ? inputLogoRef    : inputLogoDarkRef
    setSubiendo(true)
    try {
      const url = await subirImagenLogo(archivo)
      setDatos(d => ({ ...d, [campo]: url }))
      toast('Logo subido correctamente', 'exito')
    } catch (err) {
      toast('Error al subir: ' + err.message, 'error')
    } finally {
      setSubiendo(false)
      if (ref.current) ref.current.value = ''
    }
  }

  const campo = (key) => ({
    value: datos[key] ?? '',
    onChange: (e) => setDatos(d => ({ ...d, [key]: e.target.value })),
  })

  const ejecutarReset = async (tipo) => {
    const mensajes = {
      clientes: 'BORRAR CLIENTES',
      pedidos: 'BORRAR PEDIDOS',
      catalogo: 'BORRAR CATALOGO',
      todo: 'BORRAR TODO',
    }
    const confirmado = prompt(`Esta accion no se puede deshacer. Escribe "${mensajes[tipo]}" para confirmar.`)
    if (confirmado !== mensajes[tipo]) {
      toast('Reset cancelado', 'aviso')
      return
    }

    setResetActivo(tipo)
    try {
      if (tipo === 'clientes') {
        await limpiarClientes()
      }
      if (tipo === 'pedidos') {
        await limpiarPedidos()
      }
      if (tipo === 'catalogo') {
        await limpiarProductos()
        await limpiarCategorias()
      }
      if (tipo === 'todo') {
        await limpiarPedidos()
        await limpiarClientes()
        await limpiarProductos()
        await limpiarCategorias()
        await limpiarBanners()
      }
      toast('Datos eliminados correctamente', 'exito')
    } catch (err) {
      toast('Error al limpiar datos: ' + err.message, 'error')
    } finally {
      setResetActivo('')
    }
  }

  return (
    <div className="animate-fade-in max-w-xl">
      {/* Título */}
      <div className="mb-6">
        <h1 className="font-bold text-xl text-marca-negro">Configuración</h1>
        <p className="text-sm text-marca-texto-suave mt-1">Gestiona la información y preferencias de tu tienda</p>
      </div>

      {/* Tabs */}
      <div className="bg-marca-beige rounded-2xl p-1 flex gap-1 mb-6">
        {TABS.map(({ id, label, icono: Icono }) => (
          <button
            key={id}
            onClick={() => setTabActivo(id)}
            className={`relative flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl
                        text-sm font-medium transition-all duration-200
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

            {/* Logo modo claro */}
            <div className="bg-white rounded-2xl shadow-tarjeta p-5">
              <SeccionHeader icono={ImageIcon} titulo="Logo — Modo claro" subtitulo="Se muestra en la tienda y el panel (fondo blanco)" />

              <div className="flex items-start gap-4 mb-5">
                <div className="w-24 h-24 rounded-2xl bg-marca-beige-suave border-2 border-marca-beige-borde flex items-center justify-center overflow-hidden shrink-0">
                  {datos.logo
                    ? <img src={datos.logo} alt="Logo" className="w-full h-full object-contain p-2" />
                    : <ImageIcon size={26} className="text-marca-beige-borde" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-marca-negro">Logo actual</p>
                  <p className="text-xs text-marca-texto-suave mt-1 break-all leading-relaxed">
                    {datos.logo ? datos.logo.split('/').pop() : 'Ninguno'}
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => inputLogoRef.current?.click()}
                    disabled={subiendoLogo}
                    className="mt-3 inline-flex items-center gap-1.5 bg-marca-beige text-marca-marron-oscuro
                               text-xs font-semibold px-3.5 py-2 rounded-xl hover:bg-marca-beige-borde
                               transition-colors disabled:opacity-60"
                  >
                    {subiendoLogo
                      ? <div className="w-3 h-3 border border-marca-marron/30 border-t-marca-marron rounded-full animate-spin" />
                      : <Upload size={13} />
                    }
                    {subiendoLogo ? 'Subiendo...' : 'Subir imagen'}
                  </motion.button>
                  <input ref={inputLogoRef} type="file" accept="image/*" className="hidden" onChange={e => handleSubirLogo(e, 'logo')} />
                </div>
              </div>

              <p className="text-xs font-semibold text-marca-texto-suave uppercase tracking-wider mb-3">Logos disponibles</p>
              <GridLogos valor={datos.logo} onChange={v => setDatos(d => ({ ...d, logo: v }))} />

              <div className="mt-5 pt-4 border-t border-marca-beige-borde">
                <label className="etiqueta">O usa una URL personalizada</label>
                <input {...campo('logo')} className="input-campo" placeholder="https://..." />
              </div>
            </div>

            {/* Logo modo oscuro */}
            <div className="bg-white rounded-2xl shadow-tarjeta p-5">
              <SeccionHeader icono={Moon} titulo="Logo — Modo oscuro" subtitulo="Se muestra cuando el panel está en modo oscuro" iconoBg="bg-[#2A2419]" />

              <div className="flex items-start gap-4 mb-5">
                <div className="w-24 h-24 rounded-2xl bg-[#1A1512] border-2 border-[#3D3426] flex items-center justify-center overflow-hidden shrink-0">
                  {datos.logoDark
                    ? <img src={datos.logoDark} alt="Logo dark" className="w-full h-full object-contain p-2" />
                    : <ImageIcon size={26} className="text-[#3D3426]" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-marca-negro">Logo modo oscuro</p>
                  <p className="text-xs text-marca-texto-suave mt-1 break-all leading-relaxed">
                    {datos.logoDark ? datos.logoDark.split('/').pop() : 'Usa el logo claro por defecto'}
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => inputLogoDarkRef.current?.click()}
                      disabled={subiendoLogoDark}
                      className="inline-flex items-center gap-1.5 bg-marca-beige text-marca-marron-oscuro
                                 text-xs font-semibold px-3.5 py-2 rounded-xl hover:bg-marca-beige-borde
                                 transition-colors disabled:opacity-60"
                    >
                      {subiendoLogoDark
                        ? <div className="w-3 h-3 border border-marca-marron/30 border-t-marca-marron rounded-full animate-spin" />
                        : <Upload size={13} />
                      }
                      {subiendoLogoDark ? 'Subiendo...' : 'Subir imagen'}
                    </motion.button>
                    {datos.logoDark && (
                      <button
                        onClick={() => setDatos(d => ({ ...d, logoDark: null }))}
                        className="text-xs text-marca-texto-suave hover:text-red-500 transition-colors px-2"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                  <input ref={inputLogoDarkRef} type="file" accept="image/*" className="hidden" onChange={e => handleSubirLogo(e, 'logoDark')} />
                </div>
              </div>

              <p className="text-xs font-semibold text-marca-texto-suave uppercase tracking-wider mb-3">Logos disponibles</p>
              <GridLogos valor={datos.logoDark} onChange={v => setDatos(d => ({ ...d, logoDark: v }))} fondo="bg-[#1A1512]" />

              <div className="mt-5 pt-4 border-t border-marca-beige-borde">
                <label className="etiqueta">O usa una URL personalizada</label>
                <input {...campo('logoDark')} className="input-campo" placeholder="https://..." />
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
              <SeccionHeader icono={Lock} titulo="Cambiar contraseña" subtitulo="Actualiza tu acceso al panel de administración" />
              <div className="space-y-4">
                {[
                  { key: 'actual',    label: 'Contraseña actual' },
                  { key: 'nueva',     label: 'Nueva contraseña' },
                  { key: 'confirmar', label: 'Confirmar nueva contraseña' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="etiqueta">{label}</label>
                    <div className="relative">
                      <input
                        type={verPass[key] ? 'text' : 'password'}
                        value={pass[key]}
                        onChange={e => setPass(p => ({ ...p, [key]: e.target.value }))}
                        className="input-campo pr-11"
                      />
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
              <Lock size={16} />Cambiar contraseña
            </motion.button>
          </motion.div>
        )}

        {/* Reset */}
        {tabActivo === 'reset' && (
          <motion.div key="reset" variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
            <div className="bg-white rounded-2xl shadow-tarjeta p-5">
              <SeccionHeader icono={AlertTriangle} titulo="Reset de datos" subtitulo="Limpia registros del banco de datos" iconoBg="bg-red-50" />

              <div className="space-y-3">
                {[
                  {
                    id: 'clientes',
                    titulo: 'Borrar todos los clientes',
                    texto: 'Elimina la lista de clientes y sus totales acumulados.',
                    accion: 'Borrar clientes',
                  },
                  {
                    id: 'pedidos',
                    titulo: 'Borrar toda la lista de compras',
                    texto: 'Elimina todos los pedidos registrados.',
                    accion: 'Borrar pedidos',
                  },
                  {
                    id: 'catalogo',
                    titulo: 'Borrar productos y categorias',
                    texto: 'Elimina productos registrados y despues sus categorias.',
                    accion: 'Borrar catalogo',
                  },
                  {
                    id: 'todo',
                    titulo: 'Borrar todo',
                    texto: 'Elimina clientes, pedidos, productos, categorias y banners.',
                    accion: 'Borrar todo',
                  },
                ].map(opcion => (
                  <div key={opcion.id} className="rounded-2xl border border-marca-beige-borde p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-marca-negro text-sm">{opcion.titulo}</p>
                        <p className="text-xs text-marca-texto-suave mt-1 leading-relaxed">{opcion.texto}</p>
                      </div>
                      <button
                        onClick={() => ejecutarReset(opcion.id)}
                        disabled={!!resetActivo}
                        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-60 transition-colors"
                      >
                        {resetActivo === opcion.id ? (
                          <span className="w-3 h-3 border border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                        {opcion.accion}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
