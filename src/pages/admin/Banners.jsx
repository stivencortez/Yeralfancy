import { useState, useRef } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff, Image, Upload, X } from 'lucide-react'
import { useBanners } from '../../store/useBanners'
import { subirImagenBanner } from '../../lib/supabase'
import { useAdminToast } from '../../layouts/LayoutAdmin'
import { Modal } from '../../components/ui/Modal'
import { EstadoVacio } from '../../components/ui/Cargando'

const LIMITE_MB = 10
const LIMITE_BYTES = LIMITE_MB * 1024 * 1024
const VACIO = { imagen: '', titulo: '', subtitulo: '', enlace: '', activo: true, orden: 1 }

function SelectorImagen({ urlActual, onCambio }) {
  const inputRef = useRef(null)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState('')

  const manejarArchivo = async (archivo) => {
    setError('')
    if (!archivo) return
    if (!archivo.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen.')
      return
    }
    if (archivo.size > LIMITE_BYTES) {
      setError(`El archivo supera el límite de ${LIMITE_MB} MB.`)
      return
    }
    setSubiendo(true)
    try {
      const url = await subirImagenBanner(archivo)
      onCambio(url)
    } catch (e) {
      setError('Error al subir la imagen: ' + e.message)
    } finally {
      setSubiendo(false)
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    const archivo = e.dataTransfer.files[0]
    if (archivo) manejarArchivo(archivo)
  }

  return (
    <div>
      <label className="etiqueta">Imagen * (formato 16:5, máx. {LIMITE_MB} MB)</label>

      {urlActual ? (
        <div className="relative rounded-xl overflow-hidden bg-marca-beige" style={{ aspectRatio: '16/5' }}>
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
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current.click()}
          className="cursor-pointer border-2 border-dashed border-marca-beige-borde rounded-xl flex flex-col items-center justify-center gap-2 py-8 hover:border-marca-marron hover:bg-marca-beige/40 transition-colors"
        >
          {subiendo ? (
            <div className="flex flex-col items-center gap-2 text-marca-texto-suave">
              <div className="w-6 h-6 border-2 border-marca-marron border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Subiendo...</span>
            </div>
          ) : (
            <>
              <Upload size={24} className="text-marca-marron" />
              <span className="text-sm font-medium text-marca-negro">Haz clic o arrastra la imagen aquí</span>
              <span className="text-xs text-marca-texto-suave">JPG, PNG, WEBP · Máx. {LIMITE_MB} MB</span>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => manejarArchivo(e.target.files[0])}
      />

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function FormBanner({ datos, setDatos, onGuardar, onCancelar }) {
  return (
    <div className="space-y-4">
      <SelectorImagen
        urlActual={datos.imagen}
        onCambio={url => setDatos(d => ({ ...d, imagen: url }))}
      />
      <div>
        <label className="etiqueta">Título</label>
        <input value={datos.titulo} onChange={e => setDatos(d => ({ ...d, titulo: e.target.value }))} className="input-campo" placeholder="Título del banner" />
      </div>
      <div>
        <label className="etiqueta">Subtítulo</label>
        <input value={datos.subtitulo} onChange={e => setDatos(d => ({ ...d, subtitulo: e.target.value }))} className="input-campo" placeholder="Texto secundario" />
      </div>
      <div>
        <label className="etiqueta">Enlace al hacer clic</label>
        <input value={datos.enlace} onChange={e => setDatos(d => ({ ...d, enlace: e.target.value }))} className="input-campo" placeholder="/categorias o /producto/id" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="etiqueta">Orden</label>
          <input type="number" min="1" value={datos.orden} onChange={e => setDatos(d => ({ ...d, orden: Number(e.target.value) }))} className="input-campo" />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={datos.activo} onChange={e => setDatos(d => ({ ...d, activo: e.target.checked }))} className="w-4 h-4 accent-marca-marron" />
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

export default function Banners() {
  const { banners, agregarBanner, editarBanner, eliminarBanner, toggleActivo } = useBanners()
  const toast = useAdminToast()
  const [modalNuevo, setModalNuevo] = useState(false)
  const [modalEditar, setModalEditar] = useState(null)
  const [nuevo, setNuevo] = useState({ ...VACIO })

  const manejarGuardarNuevo = async () => {
    if (!nuevo.imagen) { toast('La imagen es requerida', 'error'); return }
    try {
      await agregarBanner(nuevo)
      setModalNuevo(false)
      setNuevo({ ...VACIO })
      toast('Banner creado correctamente', 'exito')
    } catch (err) {
      toast('Error al guardar banner: ' + err.message, 'error')
    }
  }

  const manejarGuardarEditar = async () => {
    if (!modalEditar.imagen) { toast('La imagen es requerida', 'error'); return }
    try {
      await editarBanner(modalEditar.id, modalEditar)
      setModalEditar(null)
      toast('Banner actualizado correctamente', 'exito')
    } catch (err) {
      toast('Error al actualizar banner: ' + err.message, 'error')
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-bold text-xl text-marca-negro">Banners</h1>
        <button onClick={() => setModalNuevo(true)} className="btn-primario py-2 px-4 text-sm flex items-center gap-2">
          <Plus size={16} /> Nuevo
        </button>
      </div>

      <div className="space-y-3">
        {banners.length === 0 ? (
          <EstadoVacio icono={<Image size={32} className="text-marca-beige-borde" />} titulo="Sin banners" descripcion="Agrega el primer banner de tu tienda." />
        ) : (
          [...banners].sort((a, b) => a.orden - b.orden).map(b => (
            <div key={b.id} className={`bg-white rounded-2xl shadow-tarjeta overflow-hidden ${!b.activo ? 'opacity-60' : ''}`}>
              <div className="relative" style={{ aspectRatio: '16/5' }}>
                {b.imagen ? (
                  <img src={b.imagen} alt={b.titulo} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-marca-beige flex items-center justify-center">
                    <Image size={24} className="text-marca-beige-borde" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${b.activo ? 'bg-emerald-500 text-white' : 'bg-gray-400 text-white'}`}>
                    {b.activo ? 'Activo' : 'Inactivo'}
                  </span>
                  <span className="text-xs bg-black/50 text-white px-2 py-0.5 rounded-full">#{b.orden}</span>
                </div>
              </div>
              <div className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-marca-negro text-sm">{b.titulo || 'Sin título'}</p>
                  {b.subtitulo && <p className="text-xs text-marca-texto-suave">{b.subtitulo}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => toggleActivo(b.id)} className="w-8 h-8 rounded-xl hover:bg-marca-beige flex items-center justify-center text-marca-texto-suave transition-colors">
                    {b.activo ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <button onClick={() => setModalEditar({ ...b })} className="w-8 h-8 rounded-xl hover:bg-marca-beige flex items-center justify-center text-marca-texto-suave transition-colors">
                    <Edit2 size={15} />
                  </button>
                  <button onClick={async () => { if (confirm('¿Eliminar este banner?')) { try { await eliminarBanner(b.id); toast('Banner eliminado', 'aviso') } catch(e) { toast('Error al eliminar: ' + e.message, 'error') } } }} className="w-8 h-8 rounded-xl hover:bg-red-50 flex items-center justify-center text-red-400 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal abierto={modalNuevo} onCerrar={() => setModalNuevo(false)} titulo="Nuevo banner" tamano="md">
        <FormBanner datos={nuevo} setDatos={setNuevo} onGuardar={manejarGuardarNuevo} onCancelar={() => setModalNuevo(false)} />
      </Modal>
      <Modal abierto={!!modalEditar} onCerrar={() => setModalEditar(null)} titulo="Editar banner" tamano="md">
        {modalEditar && <FormBanner datos={modalEditar} setDatos={setModalEditar} onGuardar={manejarGuardarEditar} onCancelar={() => setModalEditar(null)} />}
      </Modal>
    </div>
  )
}
