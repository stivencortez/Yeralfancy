import { useState, useRef } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff, Upload, X, Smartphone, Info, ChevronDown, ChevronUp } from 'lucide-react'
import { usePWAIntro } from '../../store/usePWAIntro'
import { subirImagenBanner } from '../../lib/supabase'
import { useAdminToast } from '../../layouts/LayoutAdmin'
import { useConfig } from '../../store/useConfig'
import { Modal } from '../../components/ui/Modal'
import { EstadoVacio } from '../../components/ui/Cargando'

const LIMITE_MB = 10
const LIMITE_BYTES = LIMITE_MB * 1024 * 1024

const BANNER_VACIO = {
  imagen: '',
  botonTexto: 'Desliza para entrar',
  corHint: '#ffffff',
  activo: true,
  orden: 1,
}

const MODOS = [
  { valor: 'siempre',        etiqueta: 'Mostrar siempre al abrir' },
  { valor: 'primera_vez',    etiqueta: 'Solo la primera vez' },
  { valor: 'una_vez_al_dia', etiqueta: 'Una vez por día' },
]

// ─── Selector de imagen ───────────────────────────────────────────────────────
function SelectorImagen({ urlActual, onCambio }) {
  const inputRef = useRef(null)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')

  const manejarArchivo = async (archivo) => {
    setError('')
    if (!archivo) return
    if (!archivo.type.startsWith('image/')) { setError('El archivo debe ser una imagen.'); return }
    if (archivo.size > LIMITE_BYTES) { setError(`Máximo ${LIMITE_MB} MB.`); return }
    setSubiendo(true)
    try {
      const url = await subirImagenBanner(archivo)
      onCambio(url)
    } catch (e) {
      setError('Error al subir: ' + e.message)
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <div>
      <label className="etiqueta">Imagen (recomendado 9:16 · máx. {LIMITE_MB} MB)</label>
      {urlActual ? (
        <div className="relative rounded-xl overflow-hidden bg-marca-beige" style={{ aspectRatio: '9/16', maxHeight: 220 }}>
          <img src={urlActual} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => { onCambio(''); inputRef.current.value = '' }}
            className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onDrop={e => { e.preventDefault(); manejarArchivo(e.dataTransfer.files[0]) }}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current.click()}
          className="cursor-pointer border-2 border-dashed border-marca-beige-borde rounded-xl flex flex-col items-center justify-center gap-2 py-8 hover:border-marca-marron hover:bg-marca-beige/40 transition-colors"
        >
          {subiendo ? (
            <div className="flex flex-col items-center gap-2 text-marca-texto-suave">
              <div className="w-6 h-6 border-2 border-marca-marron border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Subiendo…</span>
            </div>
          ) : (
            <>
              <Upload size={24} className="text-marca-marron" />
              <span className="text-sm font-medium text-marca-negro">Clic o arrastra la imagen aquí</span>
              <span className="text-xs text-marca-texto-suave">JPG, PNG, WEBP · Máx. {LIMITE_MB} MB</span>
            </>
          )}
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => manejarArchivo(e.target.files[0])} />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

// ─── Formulario de banner ─────────────────────────────────────────────────────
function FormBanner({ datos, setDatos, onGuardar, onCancelar }) {
  return (
    <div className="space-y-4">
      <SelectorImagen urlActual={datos.imagen} onCambio={url => setDatos(d => ({ ...d, imagen: url }))} />
      <div>
        <label className="etiqueta">Texto del botón</label>
        <input
          value={datos.botonTexto}
          onChange={e => setDatos(d => ({ ...d, botonTexto: e.target.value }))}
          className="input-campo"
          placeholder="Desliza para entrar"
        />
      </div>
      <div>
        <label className="etiqueta">Color del texto de indicación</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={datos.corHint || '#ffffff'}
            onChange={e => setDatos(d => ({ ...d, corHint: e.target.value }))}
            className="w-10 h-10 rounded-lg cursor-pointer border border-marca-beige-borde bg-transparent"
          />
          <span className="text-sm text-marca-texto-suave font-mono">{datos.corHint || '#ffffff'}</span>
          <span className="text-xs text-marca-texto-suave">Texto "Desliza para descubrir"</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="etiqueta">Orden</label>
          <input
            type="number" min="1"
            value={datos.orden}
            onChange={e => setDatos(d => ({ ...d, orden: Number(e.target.value) }))}
            className="input-campo"
          />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={datos.activo}
              onChange={e => setDatos(d => ({ ...d, activo: e.target.checked }))}
              className="w-4 h-4 accent-marca-marron"
            />
            <span className="text-sm font-medium text-marca-negro">Activo</span>
          </label>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={onCancelar} className="flex-1 btn-outline py-3">Cancelar</button>
        <button onClick={onGuardar} className="flex-1 btn-primario py-3">Guardar</button>
      </div>
    </div>
  )
}

// ─── Vista previa mobile ──────────────────────────────────────────────────────
function VistaPrevia({ banner, config }) {
  const tieneBanner = !!banner?.imagen
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs font-medium text-marca-texto-suave uppercase tracking-widest">Vista previa</p>
      <div
        className="relative rounded-[28px] overflow-hidden shadow-modal"
        style={{ width: 160, height: 290, background: tieneBanner ? 'transparent' : 'linear-gradient(160deg,#1C1C1C,#3D2B1A 60%,#7A5C3A)' }}
      >
        {/* Imagen de fondo */}
        {tieneBanner && (
          <img src={banner.imagen} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
        {/* Overlay */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 35%, rgba(0,0,0,0.8) 100%)' }} />
        {/* Logo */}
        <div className="absolute top-5 left-0 right-0 flex justify-center">
          {config?.logo ? (
            <img src={config.logo} alt="" className="h-5 object-contain" style={{ filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
          ) : (
            <span className="text-white text-[10px] font-display font-bold tracking-widest opacity-90">YERAL FANCY</span>
          )}
        </div>
        {/* Textos */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 space-y-1.5">
          <div className="flex gap-1 justify-center mb-1">
            <div className="w-4 h-1 rounded-full bg-marca-dorado/80" />
            <div className="w-1.5 h-1 rounded-full bg-white/30" />
          </div>
          <p
            className="text-[6px] text-center tracking-widest uppercase"
            style={{ color: banner?.corHint || '#ffffff', opacity: 0.7 }}
          >Desliza para descubrir</p>
          {/* Botón simulado */}
          <div
            className="flex items-center rounded-full overflow-hidden"
            style={{ height: 20, background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.18)' }}
          >
            <div className="w-4 h-4 rounded-full bg-white/95 shrink-0 ml-0.5 flex items-center justify-center">
              <svg width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="#9B7B5B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
            <span className="text-white/60 text-[6px] ml-1 truncate pr-1">{banner?.botonTexto || 'Desliza para entrar'}</span>
          </div>
        </div>
        {/* Marco de teléfono — notch */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-10 h-1 bg-black/60 rounded-full" />
      </div>
    </div>
  )
}

// ─── Nota SQL ─────────────────────────────────────────────────────────────────
function NotaSQL() {
  const [abierta, setAbierta] = useState(false)
  const sql = `-- Ejecutar en Supabase SQL Editor
CREATE TABLE IF NOT EXISTS pwa_intro_config (
  id integer PRIMARY KEY DEFAULT 1,
  habilitado boolean NOT NULL DEFAULT true,
  modo_visualizacion text NOT NULL DEFAULT 'siempre',
  CONSTRAINT solo_una_fila CHECK (id = 1)
);
INSERT INTO pwa_intro_config (id, habilitado, modo_visualizacion)
VALUES (1, true, 'siempre') ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS pwa_intro_banners (
  id text PRIMARY KEY,
  imagen text NOT NULL DEFAULT '',
  titulo text NOT NULL DEFAULT '',
  subtitulo text NOT NULL DEFAULT '',
  boton_texto text NOT NULL DEFAULT 'Desliza para entrar',
  activo boolean NOT NULL DEFAULT true,
  orden integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);`

  return (
    <div className="rounded-2xl border border-marca-beige-borde bg-marca-beige/40 overflow-hidden">
      <button
        onClick={() => setAbierta(a => !a)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <Info size={15} className="text-marca-marron shrink-0" />
          <span className="text-sm font-medium text-marca-negro">Configuración de base de datos (Supabase)</span>
        </div>
        {abierta ? <ChevronUp size={15} className="text-marca-texto-suave" /> : <ChevronDown size={15} className="text-marca-texto-suave" />}
      </button>
      {abierta && (
        <div className="px-4 pb-4 space-y-2">
          <p className="text-xs text-marca-texto-suave">
            Para que los banners PWA persistan en la nube, ejecuta este SQL en tu panel de Supabase (SQL Editor):
          </p>
          <pre className="text-[10px] bg-marca-negro text-marca-beige rounded-xl p-3 overflow-x-auto leading-relaxed whitespace-pre-wrap">{sql}</pre>
          <p className="text-xs text-marca-texto-suave">
            Sin estas tablas, la configuración se guarda solo en este dispositivo (localStorage).
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function PWAIntro() {
  const { config, banners, actualizarConfig, agregarBanner, editarBanner, eliminarBanner, toggleActivo, getBannersActivos } = usePWAIntro()
  const configTienda = useConfig(s => s.config)
  const toast = useAdminToast()

  const [modalNuevo, setModalNuevo] = useState(false)
  const [modalEditar, setModalEditar] = useState(null)
  const [nuevo, setNuevo] = useState({ ...BANNER_VACIO })

  const bannersOrdenados = [...banners].sort((a, b) => a.orden - b.orden)
  const bannersActivos = getBannersActivos()
  const bannerPreview = bannersActivos[0] || (bannersOrdenados[0]) || null

  const guardarNuevo = () => {
    agregarBanner(nuevo)
    setModalNuevo(false)
    setNuevo({ ...BANNER_VACIO })
    toast('Banner PWA creado', 'exito')
  }

  const guardarEditar = () => {
    editarBanner(modalEditar.id, modalEditar)
    setModalEditar(null)
    toast('Banner PWA actualizado', 'exito')
  }

  return (
    <div className="animate-fade-in">
      {/* ── Encabezado ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-marca-beige flex items-center justify-center">
            <Smartphone size={18} className="text-marca-marron" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-marca-negro leading-tight">Pantalla PWA</h1>
            <p className="text-xs text-marca-texto-suave">Pantalla de entrada para la app instalada</p>
          </div>
        </div>
        <button
          onClick={() => setModalNuevo(true)}
          className="btn-primario py-2 px-4 text-sm flex items-center gap-2"
        >
          <Plus size={16} /> Nuevo banner
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto] gap-6">
        <div className="space-y-5">
          {/* ── Configuración global ── */}
          <div className="bg-white rounded-2xl shadow-tarjeta p-5 space-y-4">
            <h2 className="font-semibold text-marca-negro text-sm">Configuración general</h2>

            {/* Toggle habilitado */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-marca-negro">Activar pantalla de entrada</p>
                <p className="text-xs text-marca-texto-suave">Solo se muestra en la app instalada en mobile</p>
              </div>
              <button
                onClick={() => actualizarConfig({ habilitado: !config.habilitado })}
                className="relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0"
                style={{ background: config.habilitado ? '#9B7B5B' : '#E8D8C0' }}
              >
                <span
                  className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-all duration-300"
                  style={{ left: config.habilitado ? '24px' : '3px' }}
                />
              </button>
            </div>

            {/* Modo de visualización */}
            <div>
              <label className="etiqueta">Modo de visualización</label>
              <select
                value={config.modoVisualizacion}
                onChange={e => actualizarConfig({ modoVisualizacion: e.target.value })}
                className="input-campo"
              >
                {MODOS.map(m => (
                  <option key={m.valor} value={m.valor}>{m.etiqueta}</option>
                ))}
              </select>
            </div>

            {/* Badge de estado */}
            <div className="flex items-center gap-2 text-xs text-marca-texto-suave pt-1">
              <div className={`w-2 h-2 rounded-full ${config.habilitado ? 'bg-emerald-400' : 'bg-gray-300'}`} />
              <span>
                {config.habilitado
                  ? `Activa · ${MODOS.find(m => m.valor === config.modoVisualizacion)?.etiqueta}`
                  : 'Desactivada'}
              </span>
            </div>
          </div>

          {/* ── Lista de banners ── */}
          <div className="space-y-3">
            <h2 className="font-semibold text-marca-negro text-sm px-1">Banners de entrada</h2>
            {bannersOrdenados.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-tarjeta">
                <EstadoVacio
                  icono={<Smartphone size={32} className="text-marca-beige-borde" />}
                  titulo="Sin banners PWA"
                  descripcion="Agrega un banner para personalizar la pantalla de entrada."
                />
              </div>
            ) : (
              bannersOrdenados.map(b => (
                <div key={b.id} className={`bg-white rounded-2xl shadow-tarjeta overflow-hidden ${!b.activo ? 'opacity-60' : ''}`}>
                  <div className="flex gap-3 p-3">
                    {/* Miniatura */}
                    <div
                      className="w-16 h-20 rounded-xl overflow-hidden shrink-0 bg-marca-beige flex items-center justify-center"
                    >
                      {b.imagen ? (
                        <img src={b.imagen} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div
                          className="w-full h-full"
                          style={{ background: 'linear-gradient(160deg,#1C1C1C,#7A5C3A)' }}
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${b.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                            {b.activo ? 'Activo' : 'Inactivo'}
                          </span>
                          <span className="text-[10px] bg-marca-beige text-marca-texto-suave px-1.5 py-0.5 rounded-full">#{b.orden}</span>
                        </div>
                        <p className="font-semibold text-marca-negro text-sm truncate">{b.titulo || 'Sin título'}</p>
                        {b.subtitulo && <p className="text-xs text-marca-texto-suave truncate">{b.subtitulo}</p>}
                        {b.botonTexto && <p className="text-[10px] text-marca-marron mt-0.5">"{b.botonTexto}"</p>}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col gap-1 shrink-0">
                      <button onClick={() => toggleActivo(b.id)} className="w-8 h-8 rounded-xl hover:bg-marca-beige flex items-center justify-center text-marca-texto-suave transition-colors">
                        {b.activo ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button onClick={() => setModalEditar({ ...b })} className="w-8 h-8 rounded-xl hover:bg-marca-beige flex items-center justify-center text-marca-texto-suave transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => { if (confirm('¿Eliminar este banner PWA?')) { eliminarBanner(b.id); toast('Banner eliminado', 'aviso') } }}
                        className="w-8 h-8 rounded-xl hover:bg-red-50 flex items-center justify-center text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── Nota SQL ── */}
          <NotaSQL />
        </div>

        {/* ── Vista previa ── */}
        <div className="xl:sticky xl:top-6 xl:self-start hidden xl:flex flex-col items-center gap-4">
          <VistaPrevia banner={bannerPreview} config={configTienda} />
          <p className="text-xs text-marca-texto-suave text-center max-w-[160px] leading-relaxed">
            Así se verá la pantalla de entrada en la app instalada
          </p>
        </div>
      </div>

      {/* ── Modales ── */}
      <Modal abierto={modalNuevo} onCerrar={() => setModalNuevo(false)} titulo="Nuevo banner PWA" tamano="md">
        <FormBanner datos={nuevo} setDatos={setNuevo} onGuardar={guardarNuevo} onCancelar={() => setModalNuevo(false)} />
      </Modal>
      <Modal abierto={!!modalEditar} onCerrar={() => setModalEditar(null)} titulo="Editar banner PWA" tamano="md">
        {modalEditar && (
          <FormBanner datos={modalEditar} setDatos={setModalEditar} onGuardar={guardarEditar} onCancelar={() => setModalEditar(null)} />
        )}
      </Modal>
    </div>
  )
}
