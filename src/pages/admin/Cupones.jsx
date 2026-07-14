import { useState } from 'react'
import { Plus, Edit2, Trash2, Tag, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useCupones } from '../../store/useCupones'
import { useCategorias } from '../../store/useCategorias'
import { useProductos } from '../../store/useProductos'
import { useAdminToast } from '../../layouts/LayoutAdmin'
import { Modal } from '../../components/ui/Modal'
import { formatearPrecio } from '../../utils/formatear'

const CUPON_VACIO = {
  codigo: '',
  nombre: '',
  tipo: 'porcentaje',
  valor: '',
  alcance: 'todo',
  categoriaId: '',
  productoId: '',
  fechaExpiracion: '',
  activo: true,
  usosMaximos: '',
}

function FormularioCupon({ datos, setDatos, onGuardar, onCancelar, categorias, productos }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="etiqueta">Código *</label>
          <input
            value={datos.codigo}
            onChange={e => setDatos(d => ({ ...d, codigo: e.target.value.replace(/\s/g, '').toUpperCase().slice(0, 20) }))}
            className="input-campo font-mono"
            placeholder="VERANO20"
          />
        </div>
        <div>
          <label className="etiqueta">Nombre interno</label>
          <input
            value={datos.nombre}
            onChange={e => setDatos(d => ({ ...d, nombre: e.target.value }))}
            className="input-campo"
            placeholder="Desc. verano"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="etiqueta">Tipo de descuento</label>
          <select value={datos.tipo} onChange={e => setDatos(d => ({ ...d, tipo: e.target.value }))} className="input-campo">
            <option value="porcentaje">Porcentaje (%)</option>
            <option value="fijo">Valor fijo ($)</option>
          </select>
        </div>
        <div>
          <label className="etiqueta">Valor *</label>
          <input
            type="number"
            min="0"
            step={datos.tipo === 'porcentaje' ? '1' : '0.01'}
            max={datos.tipo === 'porcentaje' ? '100' : undefined}
            value={datos.valor}
            onChange={e => setDatos(d => ({ ...d, valor: e.target.value }))}
            className="input-campo"
            placeholder={datos.tipo === 'porcentaje' ? '20' : '5.00'}
          />
        </div>
      </div>

      <div>
        <label className="etiqueta">Alcance del descuento</label>
        <select value={datos.alcance} onChange={e => setDatos(d => ({ ...d, alcance: e.target.value, categoriaId: '', productoId: '' }))} className="input-campo">
          <option value="todo">Toda la tienda</option>
          <option value="categoria">Por categoría</option>
          <option value="producto">Por producto</option>
        </select>
      </div>

      {datos.alcance === 'categoria' && (
        <div>
          <label className="etiqueta">Categoría *</label>
          <select value={datos.categoriaId} onChange={e => setDatos(d => ({ ...d, categoriaId: e.target.value }))} className="input-campo">
            <option value="">Seleccionar categoría</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
      )}

      {datos.alcance === 'producto' && (
        <div>
          <label className="etiqueta">Producto *</label>
          <select value={datos.productoId} onChange={e => setDatos(d => ({ ...d, productoId: e.target.value }))} className="input-campo">
            <option value="">Seleccionar producto</option>
            {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="etiqueta">Fecha de expiración</label>
          <input
            type="date"
            value={datos.fechaExpiracion}
            onChange={e => setDatos(d => ({ ...d, fechaExpiracion: e.target.value }))}
            className="input-campo"
          />
        </div>
        <div>
          <label className="etiqueta">Usos máximos</label>
          <input
            type="number"
            min="1"
            value={datos.usosMaximos}
            onChange={e => setDatos(d => ({ ...d, usosMaximos: e.target.value }))}
            className="input-campo"
            placeholder="Sin límite"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={datos.activo} onChange={e => setDatos(d => ({ ...d, activo: e.target.checked }))} className="w-4 h-4 accent-marca-marron" />
        <span className="text-sm font-medium text-marca-negro">Cupón activo</span>
      </label>

      <div className="flex gap-3 pt-2">
        <button onClick={onCancelar} className="flex-1 btn-outline py-3">Cancelar</button>
        <button onClick={onGuardar} className="flex-1 btn-primario py-3">Guardar</button>
      </div>
    </div>
  )
}

export default function Cupones() {
  const { cupones, agregarCupon, editarCupon, eliminarCupon } = useCupones()
  const categorias = useCategorias(s => s.getActivas())
  const productos = useProductos(s => s.getProductosActivos())
  const getCat = useCategorias(s => s.getCategoria)
  const getProducto = useProductos(s => s.getProducto)
  const toast = useAdminToast()

  const [modalNuevo, setModalNuevo] = useState(false)
  const [modalEditar, setModalEditar] = useState(null)
  const [nuevo, setNuevo] = useState({ ...CUPON_VACIO })

  const validar = (d) => {
    if (!d.codigo.trim()) { toast('El código es obligatorio', 'error'); return false }
    if (!d.valor || Number(d.valor) <= 0) { toast('El valor debe ser mayor a 0', 'error'); return false }
    if (d.tipo === 'porcentaje' && Number(d.valor) > 100) { toast('El porcentaje no puede superar 100', 'error'); return false }
    if (d.alcance === 'categoria' && !d.categoriaId) { toast('Selecciona una categoría', 'error'); return false }
    if (d.alcance === 'producto' && !d.productoId) { toast('Selecciona un producto', 'error'); return false }
    return true
  }

  const manejarGuardarNuevo = async () => {
    if (!validar(nuevo)) return
    const existe = cupones.find(c => c.codigo === nuevo.codigo.toUpperCase())
    if (existe) { toast('Ese código ya existe', 'error'); return }
    try {
      await agregarCupon({ ...nuevo, valor: Number(nuevo.valor), usosMaximos: nuevo.usosMaximos ? Number(nuevo.usosMaximos) : null })
      setModalNuevo(false)
      setNuevo({ ...CUPON_VACIO })
      toast('Cupón creado', 'exito')
    } catch (e) {
      toast('Error: ' + e.message, 'error')
    }
  }

  const manejarGuardarEditar = async () => {
    if (!validar(modalEditar)) return
    try {
      await editarCupon(modalEditar.id, { ...modalEditar, valor: Number(modalEditar.valor), usosMaximos: modalEditar.usosMaximos ? Number(modalEditar.usosMaximos) : null })
      setModalEditar(null)
      toast('Cupón actualizado', 'exito')
    } catch (e) {
      toast('Error: ' + e.message, 'error')
    }
  }

  const manejarEliminar = async (id) => {
    if (!confirm('¿Eliminar este cupón?')) return
    try {
      await eliminarCupon(id)
      toast('Cupón eliminado', 'exito')
    } catch (e) {
      toast('Error: ' + e.message, 'error')
    }
  }

  const etiquetaAlcance = (c) => {
    if (c.alcance === 'categoria') return `Cat: ${getCat(c.categoriaId)?.nombre || c.categoriaId}`
    if (c.alcance === 'producto') return `Prod: ${getProducto(c.productoId)?.nombre || c.productoId}`
    return 'Toda la tienda'
  }

  const estaVencido = (c) => c.fechaExpiracion && new Date(c.fechaExpiracion) < new Date(new Date().toDateString())

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-bold text-xl text-marca-negro">Cupones</h1>
        <button onClick={() => setModalNuevo(true)} className="btn-primario py-2 px-4 text-sm flex items-center gap-2">
          <Plus size={16} /> Nuevo cupón
        </button>
      </div>

      {cupones.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-tarjeta p-12 text-center">
          <Tag size={36} className="text-marca-beige-borde mx-auto mb-3" />
          <p className="font-semibold text-marca-negro">Sin cupones</p>
          <p className="text-sm text-marca-texto-suave mt-1">Crea tu primer cupón de descuento.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-tarjeta overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-marca-beige text-marca-texto-suave text-xs">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Código</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Descuento</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Alcance</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Expiración</th>
                  <th className="text-center px-4 py-3 font-medium hidden md:table-cell">Usos</th>
                  <th className="text-center px-4 py-3 font-medium">Estado</th>
                  <th className="text-right px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-marca-beige-borde">
                {cupones.map(c => {
                  const vencido = estaVencido(c)
                  return (
                    <tr key={c.id} className={`hover:bg-marca-beige/30 transition-colors ${!c.activo || vencido ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-marca-negro bg-marca-beige px-2 py-0.5 rounded-lg text-xs">{c.codigo}</span>
                        </div>
                        <p className="text-xs text-marca-texto-suave mt-0.5">{c.nombre}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="font-semibold text-marca-marron-oscuro">
                          {c.tipo === 'porcentaje' ? `${c.valor}%` : formatearPrecio(c.valor)}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-xs text-marca-texto-suave">{etiquetaAlcance(c)}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        {c.fechaExpiracion ? (
                          <span className={`text-xs ${vencido ? 'text-red-500 font-semibold' : 'text-marca-texto-suave'}`}>
                            {vencido && <AlertCircle size={11} className="inline mr-1" />}
                            {new Date(c.fechaExpiracion + 'T12:00:00').toLocaleDateString('es-VE')}
                          </span>
                        ) : (
                          <span className="text-xs text-marca-texto-suave">Sin límite</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center hidden md:table-cell text-xs text-marca-texto-suave">
                        {c.usosActuales}{c.usosMaximos ? `/${c.usosMaximos}` : ''}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          !c.activo || vencido
                            ? 'bg-red-50 text-red-500'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {!c.activo ? 'Inactivo' : vencido ? 'Vencido' : 'Activo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setModalEditar({ ...c, valor: String(c.valor), usosMaximos: c.usosMaximos ? String(c.usosMaximos) : '', fechaExpiracion: c.fechaExpiracion || '' })}
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-marca-beige text-marca-texto-suave transition-colors">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => manejarEliminar(c.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 text-marca-texto-suave hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal abierto={modalNuevo} onCerrar={() => setModalNuevo(false)} titulo="Nuevo cupón" tamano="sm">
        <FormularioCupon datos={nuevo} setDatos={setNuevo} categorias={categorias} productos={productos} onGuardar={manejarGuardarNuevo} onCancelar={() => setModalNuevo(false)} />
      </Modal>

      <Modal abierto={!!modalEditar} onCerrar={() => setModalEditar(null)} titulo="Editar cupón" tamano="sm">
        {modalEditar && <FormularioCupon datos={modalEditar} setDatos={setModalEditar} categorias={categorias} productos={productos} onGuardar={manejarGuardarEditar} onCancelar={() => setModalEditar(null)} />}
      </Modal>
    </div>
  )
}
