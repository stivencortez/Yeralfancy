import { useRef, useState } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff, Tag, Upload, Image, X } from 'lucide-react'
import { useCategorias } from '../../store/useCategorias'
import { subirImagenCategoria } from '../../lib/supabase'
import { useAdminToast } from '../../layouts/LayoutAdmin'
import { Modal } from '../../components/ui/Modal'
import { EstadoVacio } from '../../components/ui/Cargando'

const LIMITE_MB = 5
const LIMITE_BYTES = LIMITE_MB * 1024 * 1024
const VACIA = { nombre: '', descripcion: '', imagen: '', activa: true, orden: 1 }

function SelectorImagenCategoria({ urlActual, onCambio }) {
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
      setError(`El archivo supera el limite de ${LIMITE_MB} MB.`)
      return
    }
    setSubiendo(true)
    try {
      const url = await subirImagenCategoria(archivo)
      onCambio(url)
    } catch (e) {
      setError('Error al subir la imagen: ' + e.message)
    } finally {
      setSubiendo(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const limpiar = () => {
    onCambio('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <label className="etiqueta">Imagen de categoria</label>

      {urlActual ? (
        <div className="relative rounded-xl overflow-hidden bg-marca-beige border border-marca-beige-borde" style={{ aspectRatio: '16/9' }}>
          <img src={urlActual} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={limpiar}
            className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
            title="Quitar imagen"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onDrop={e => { e.preventDefault(); manejarArchivo(e.dataTransfer.files[0]) }}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="cursor-pointer border-2 border-dashed border-marca-beige-borde rounded-xl flex flex-col items-center justify-center gap-2 py-7 hover:border-marca-marron hover:bg-marca-beige/40 transition-colors"
        >
          {subiendo ? (
            <div className="flex flex-col items-center gap-2 text-marca-texto-suave">
              <div className="w-6 h-6 border-2 border-marca-marron border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Subiendo...</span>
            </div>
          ) : (
            <>
              <Upload size={24} className="text-marca-marron" />
              <span className="text-sm font-medium text-marca-negro">Haz clic o arrastra la imagen aqui</span>
              <span className="text-xs text-marca-texto-suave">JPG, PNG, WEBP - Max. {LIMITE_MB} MB</span>
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

function FormCategoria({ datos, setDatos, onGuardar, onCancelar }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="etiqueta">Nombre *</label>
        <input value={datos.nombre} onChange={e => setDatos(d => ({ ...d, nombre: e.target.value }))} className="input-campo" placeholder="Ej: Collares" />
      </div>
      <div>
        <label className="etiqueta">Descripción</label>
        <textarea value={datos.descripcion} onChange={e => setDatos(d => ({ ...d, descripcion: e.target.value }))} className="input-campo resize-none" rows={2} placeholder="Descripción breve..." />
      </div>
      <div>
        <SelectorImagenCategoria
          urlActual={datos.imagen}
          onCambio={url => setDatos(d => ({ ...d, imagen: url }))}
        />
      </div>
      <div>
        <label className="etiqueta">Orden de aparición</label>
        <input type="number" min="1" value={datos.orden} onChange={e => setDatos(d => ({ ...d, orden: Number(e.target.value) }))} className="input-campo" />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={datos.activa} onChange={e => setDatos(d => ({ ...d, activa: e.target.checked }))} className="w-4 h-4 accent-marca-marron" />
        <span className="text-sm font-medium text-marca-negro">Activa</span>
      </label>
      <div className="flex gap-3 pt-2">
        <button onClick={onCancelar} className="flex-1 btn-outline py-3">Cancelar</button>
        <button onClick={onGuardar} className="flex-1 btn-primario py-3">Guardar</button>
      </div>
    </div>
  )
}

export default function CategoriasAdmin() {
  const { categorias, agregarCategoria, editarCategoria, eliminarCategoria, toggleActiva } = useCategorias()
  const toast = useAdminToast()
  const [modalNueva, setModalNueva] = useState(false)
  const [modalEditar, setModalEditar] = useState(null)
  const [nueva, setNueva] = useState({ ...VACIA })

  const manejarGuardarNueva = async () => {
    if (!nueva.nombre.trim()) { toast('El nombre es requerido', 'error'); return }
    try {
      await agregarCategoria({ ...nueva, orden: Number(nueva.orden) || 1 })
      setModalNueva(false)
      setNueva({ ...VACIA })
      toast('Categoría creada correctamente', 'exito')
    } catch (err) {
      toast('Error al guardar categoría: ' + err.message, 'error')
    }
  }

  const manejarGuardarEditar = async () => {
    if (!modalEditar.nombre.trim()) { toast('El nombre es requerido', 'error'); return }
    try {
      await editarCategoria(modalEditar.id, modalEditar)
      setModalEditar(null)
      toast('Categoría actualizada correctamente', 'exito')
    } catch (err) {
      toast('Error al actualizar categoría: ' + err.message, 'error')
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-bold text-xl text-marca-negro">Categorías</h1>
        <button onClick={() => setModalNueva(true)} className="btn-primario py-2 px-4 text-sm flex items-center gap-2">
          <Plus size={16} /> Nueva
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categorias.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3">
            <EstadoVacio icono={<Tag size={32} className="text-marca-beige-borde" />} titulo="Sin categorías" />
          </div>
        ) : (
          [...categorias].sort((a, b) => a.orden - b.orden).map(c => (
            <div key={c.id} className={`bg-white rounded-2xl shadow-tarjeta overflow-hidden ${!c.activa ? 'opacity-60' : ''}`}>
              <div className="h-24 overflow-hidden bg-marca-beige">
                {c.imagen ? (
                  <img src={c.imagen} alt={c.nombre} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image size={24} className="text-marca-beige-borde" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-marca-negro text-sm">{c.nombre}</h3>
                  <span className={`w-2 h-2 rounded-full ${c.activa ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                </div>
                {c.descripcion && <p className="text-xs text-marca-texto-suave line-clamp-2">{c.descripcion}</p>}
                <div className="flex items-center gap-1 mt-3">
                  <button onClick={() => toggleActiva(c.id)} className="flex-1 h-8 rounded-xl text-xs font-medium hover:bg-marca-beige transition-colors flex items-center justify-center gap-1 text-marca-texto-suave">
                    {c.activa ? <><EyeOff size={13} /> Desactivar</> : <><Eye size={13} /> Activar</>}
                  </button>
                  <button onClick={() => setModalEditar({ ...c })} className="w-8 h-8 rounded-xl hover:bg-marca-beige flex items-center justify-center text-marca-texto-suave transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={async () => { if (confirm(`¿Eliminar "${c.nombre}"?`)) { try { await eliminarCategoria(c.id); toast('Categoría eliminada', 'aviso') } catch(e) { toast('Error al eliminar: ' + e.message, 'error') } } }} className="w-8 h-8 rounded-xl hover:bg-red-50 flex items-center justify-center text-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal abierto={modalNueva} onCerrar={() => setModalNueva(false)} titulo="Nueva categoría">
        <FormCategoria datos={nueva} setDatos={setNueva} onGuardar={manejarGuardarNueva} onCancelar={() => setModalNueva(false)} />
      </Modal>
      <Modal abierto={!!modalEditar} onCerrar={() => setModalEditar(null)} titulo="Editar categoría">
        {modalEditar && <FormCategoria datos={modalEditar} setDatos={setModalEditar} onGuardar={manejarGuardarEditar} onCancelar={() => setModalEditar(null)} />}
      </Modal>
    </div>
  )
}
