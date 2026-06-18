import { useState } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff, Tag } from 'lucide-react'
import { useCategorias } from '../../store/useCategorias'
import { useAdminToast } from '../../layouts/LayoutAdmin'
import { Modal } from '../../components/ui/Modal'
import { EstadoVacio } from '../../components/ui/Cargando'

const VACIA = { nombre: '', descripcion: '', imagen: '', activa: true, orden: 1 }

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
        <label className="etiqueta">URL de imagen</label>
        <input value={datos.imagen} onChange={e => setDatos(d => ({ ...d, imagen: e.target.value }))} className="input-campo" placeholder="https://..." />
        {datos.imagen && <img src={datos.imagen} alt="" className="w-24 h-16 rounded-xl object-cover mt-2 bg-marca-beige" />}
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

  const manejarGuardarNueva = () => {
    if (!nueva.nombre.trim()) { toast('El nombre es requerido', 'error'); return }
    agregarCategoria({ ...nueva, orden: Number(nueva.orden) || 1 })
    setModalNueva(false)
    setNueva({ ...VACIA })
    toast('Categoría creada correctamente', 'exito')
  }

  const manejarGuardarEditar = () => {
    if (!modalEditar.nombre.trim()) { toast('El nombre es requerido', 'error'); return }
    editarCategoria(modalEditar.id, modalEditar)
    setModalEditar(null)
    toast('Categoría actualizada correctamente', 'exito')
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
                  <div className="w-full h-full flex items-center justify-center text-3xl">💎</div>
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
                  <button onClick={() => { if (confirm(`¿Eliminar "${c.nombre}"?`)) { eliminarCategoria(c.id); toast('Categoría eliminada', 'aviso') } }} className="w-8 h-8 rounded-xl hover:bg-red-50 flex items-center justify-center text-red-400 transition-colors">
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
