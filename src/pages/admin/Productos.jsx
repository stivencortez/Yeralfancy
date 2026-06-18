import { useState } from 'react'
import { Plus, Edit2, Trash2, Eye, EyeOff, Star, Search, Package } from 'lucide-react'
import { useProductos } from '../../store/useProductos'
import { useCategorias } from '../../store/useCategorias'
import { useAdminToast } from '../../layouts/LayoutAdmin'
import { Modal } from '../../components/ui/Modal'
import { formatearPrecio, calcularGanancia, calcularMargen, generarId } from '../../utils/formatear'
import { EstadoVacio } from '../../components/ui/Cargando'

const PRODUCTO_VACIO = { nombre: '', descripcion: '', categoriaId: '', precioCosto: '', precioVenta: '', stock: '', stockMinimo: '5', fotos: [], destacado: false, activo: true }

function FormularioProducto({ datos, setDatos, categorias, onGuardar, onCancelar, titulo }) {
  const [urlFoto, setUrlFoto] = useState('')

  const agregarFoto = () => {
    if (urlFoto.trim() && datos.fotos.length < 5) {
      setDatos(d => ({ ...d, fotos: [...d.fotos, urlFoto.trim()] }))
      setUrlFoto('')
    }
  }

  const quitarFoto = (i) => setDatos(d => ({ ...d, fotos: d.fotos.filter((_, idx) => idx !== i) }))

  const ganancia = datos.precioCosto && datos.precioVenta
    ? calcularGanancia(Number(datos.precioCosto), Number(datos.precioVenta))
    : null

  return (
    <div className="space-y-4">
      <div>
        <label className="etiqueta">Nombre *</label>
        <input value={datos.nombre} onChange={e => setDatos(d => ({ ...d, nombre: e.target.value }))} className="input-campo" placeholder="Nombre del producto" />
      </div>
      <div>
        <label className="etiqueta">Descripción</label>
        <textarea value={datos.descripcion} onChange={e => setDatos(d => ({ ...d, descripcion: e.target.value }))} className="input-campo resize-none" rows={3} placeholder="Descripción del producto..." />
      </div>
      <div>
        <label className="etiqueta">Categoría</label>
        <select value={datos.categoriaId} onChange={e => setDatos(d => ({ ...d, categoriaId: e.target.value }))} className="input-campo">
          <option value="">Seleccionar categoría</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="etiqueta">Precio de costo (USD)</label>
          <input type="number" min="0" step="0.01" value={datos.precioCosto} onChange={e => setDatos(d => ({ ...d, precioCosto: e.target.value }))} className="input-campo" placeholder="0.00" />
        </div>
        <div>
          <label className="etiqueta">Precio de venta (USD)</label>
          <input type="number" min="0" step="0.01" value={datos.precioVenta} onChange={e => setDatos(d => ({ ...d, precioVenta: e.target.value }))} className="input-campo" placeholder="0.00" />
        </div>
      </div>
      {ganancia !== null && (
        <div className="flex gap-2 text-xs">
          <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-medium">
            Ganancia: {formatearPrecio(ganancia)}
          </span>
          <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium">
            Margen: {calcularMargen(Number(datos.precioCosto), Number(datos.precioVenta)).toFixed(1)}%
          </span>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="etiqueta">Stock actual</label>
          <input type="number" min="0" value={datos.stock} onChange={e => setDatos(d => ({ ...d, stock: e.target.value }))} className="input-campo" placeholder="0" />
        </div>
        <div>
          <label className="etiqueta">Stock mínimo</label>
          <input type="number" min="0" value={datos.stockMinimo} onChange={e => setDatos(d => ({ ...d, stockMinimo: e.target.value }))} className="input-campo" placeholder="5" />
        </div>
      </div>
      <div>
        <label className="etiqueta">Fotos (URL) — máx. 5</label>
        <div className="flex gap-2 mb-2">
          <input value={urlFoto} onChange={e => setUrlFoto(e.target.value)} onKeyDown={e => e.key === 'Enter' && agregarFoto()} className="input-campo flex-1" placeholder="https://..." />
          <button onClick={agregarFoto} disabled={!urlFoto.trim() || datos.fotos.length >= 5} className="btn-primario px-4 py-2.5 text-sm">Agregar</button>
        </div>
        {datos.fotos.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {datos.fotos.map((f, i) => (
              <div key={i} className="relative">
                <img src={f} alt="" className="w-16 h-16 rounded-xl object-cover bg-marca-beige" />
                <button onClick={() => quitarFoto(i)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">×</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={datos.activo} onChange={e => setDatos(d => ({ ...d, activo: e.target.checked }))} className="w-4 h-4 accent-marca-marron" />
          <span className="text-sm font-medium text-marca-negro">Activo</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={datos.destacado} onChange={e => setDatos(d => ({ ...d, destacado: e.target.checked }))} className="w-4 h-4 accent-marca-marron" />
          <span className="text-sm font-medium text-marca-negro">Destacado</span>
        </label>
      </div>
      <div className="flex gap-3 pt-2">
        <button onClick={onCancelar} className="flex-1 btn-outline py-3">Cancelar</button>
        <button onClick={onGuardar} className="flex-1 btn-primario py-3">Guardar</button>
      </div>
    </div>
  )
}

export default function Productos() {
  const { productos, agregarProducto, editarProducto, eliminarProducto, toggleActivo, toggleDestacado } = useProductos()
  const categorias = useCategorias(s => s.getActivas())
  const toast = useAdminToast()
  const getCat = useCategorias(s => s.getCategoria)

  const [busqueda, setBusqueda] = useState('')
  const [modalNuevo, setModalNuevo] = useState(false)
  const [modalEditar, setModalEditar] = useState(null)
  const [nuevo, setNuevo] = useState({ ...PRODUCTO_VACIO })

  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  const manejarGuardarNuevo = () => {
    if (!nuevo.nombre.trim() || !nuevo.precioVenta) { toast('Completa nombre y precio de venta', 'error'); return }
    agregarProducto({ ...nuevo, precioCosto: Number(nuevo.precioCosto) || 0, precioVenta: Number(nuevo.precioVenta), stock: Number(nuevo.stock) || 0, stockMinimo: Number(nuevo.stockMinimo) || 5 })
    setModalNuevo(false)
    setNuevo({ ...PRODUCTO_VACIO })
    toast('Producto creado correctamente', 'exito')
  }

  const manejarGuardarEditar = () => {
    if (!modalEditar.nombre.trim() || !modalEditar.precioVenta) { toast('Completa nombre y precio', 'error'); return }
    editarProducto(modalEditar.id, { ...modalEditar, precioCosto: Number(modalEditar.precioCosto) || 0, precioVenta: Number(modalEditar.precioVenta), stock: Number(modalEditar.stock) || 0, stockMinimo: Number(modalEditar.stockMinimo) || 5 })
    setModalEditar(null)
    toast('Producto actualizado correctamente', 'exito')
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-bold text-xl text-marca-negro">Productos</h1>
        <button onClick={() => setModalNuevo(true)} className="btn-primario py-2 px-4 text-sm flex items-center gap-2">
          <Plus size={16} /> Nuevo
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-marca-texto-suave" />
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar productos..." className="input-campo pl-9" />
      </div>

      <div className="bg-white rounded-2xl shadow-tarjeta overflow-hidden">
        {filtrados.length === 0 ? (
          <EstadoVacio icono={<Package size={32} className="text-marca-beige-borde" />} titulo="Sin productos" descripcion="Agrega tu primer producto." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-marca-beige text-marca-texto-suave text-xs">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Producto</th>
                  <th className="text-right px-4 py-3 font-medium hidden sm:table-cell">Costo</th>
                  <th className="text-right px-4 py-3 font-medium">Precio</th>
                  <th className="text-right px-4 py-3 font-medium hidden md:table-cell">Stock</th>
                  <th className="text-center px-4 py-3 font-medium hidden lg:table-cell">Estado</th>
                  <th className="text-right px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-marca-beige-borde">
                {filtrados.map(p => {
                  const cat = getCat(p.categoriaId)
                  const sinStock = p.stock === 0
                  const bajoStock = !sinStock && p.stock <= p.stockMinimo
                  return (
                    <tr key={p.id} className={`hover:bg-marca-beige/30 transition-colors ${!p.activo ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-marca-beige shrink-0">
                            {p.fotos?.[0] ? <img src={p.fotos[0]} alt="" className="w-full h-full object-cover" /> : <Package size={16} className="text-marca-beige-borde m-auto mt-3" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-marca-negro truncate max-w-[140px]">{p.nombre}</p>
                            <p className="text-xs text-marca-texto-suave">{cat?.nombre || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell text-marca-texto-suave">{formatearPrecio(p.precioCosto)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-marca-negro">{formatearPrecio(p.precioVenta)}</td>
                      <td className="px-4 py-3 text-right hidden md:table-cell">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sinStock ? 'bg-red-50 text-red-600' : bajoStock ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                          {sinStock ? 'Agotado' : bajoStock ? `Bajo (${p.stock})` : p.stock}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center hidden lg:table-cell">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${p.activo ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                          {p.destacado && <Star size={12} className="text-amber-500 fill-amber-500" />}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => toggleDestacado(p.id)} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${p.destacado ? 'bg-amber-50 text-amber-500' : 'hover:bg-marca-beige text-marca-texto-suave'}`} title={p.destacado ? 'Quitar destacado' : 'Destacar'}>
                            <Star size={14} />
                          </button>
                          <button onClick={() => toggleActivo(p.id)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-marca-beige text-marca-texto-suave transition-colors" title={p.activo ? 'Desactivar' : 'Activar'}>
                            {p.activo ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>
                          <button onClick={() => setModalEditar({ ...p })} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-marca-beige text-marca-texto-suave transition-colors">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => { if (confirm(`¿Eliminar "${p.nombre}"?`)) { eliminarProducto(p.id); toast('Producto eliminado', 'aviso') } }} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 text-red-400 transition-colors">
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
        )}
      </div>

      <Modal abierto={modalNuevo} onCerrar={() => setModalNuevo(false)} titulo="Nuevo producto" tamano="md">
        <FormularioProducto datos={nuevo} setDatos={setNuevo} categorias={categorias} onGuardar={manejarGuardarNuevo} onCancelar={() => setModalNuevo(false)} />
      </Modal>

      <Modal abierto={!!modalEditar} onCerrar={() => setModalEditar(null)} titulo="Editar producto" tamano="md">
        {modalEditar && <FormularioProducto datos={modalEditar} setDatos={setModalEditar} categorias={categorias} onGuardar={manejarGuardarEditar} onCancelar={() => setModalEditar(null)} />}
      </Modal>
    </div>
  )
}
