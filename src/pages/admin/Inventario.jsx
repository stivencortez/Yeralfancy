import { useState } from 'react'
import { Search, AlertTriangle, Package, Edit2 } from 'lucide-react'
import { useProductos } from '../../store/useProductos'
import { useCategorias } from '../../store/useCategorias'
import { useAdminToast } from '../../layouts/LayoutAdmin'
import { Modal } from '../../components/ui/Modal'
import { formatearPrecio } from '../../utils/formatear'

export default function Inventario() {
  const { productos, actualizarStock } = useProductos()
  const categorias = useCategorias(s => s.getActivas())
  const toast = useAdminToast()
  const getCat = useCategorias(s => s.getCategoria)

  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [editando, setEditando] = useState(null)
  const [nuevoStock, setNuevoStock] = useState('')

  const productosActivos = productos.filter(p => p.activo)
  const filtrados = productosActivos.filter(p => {
    const porNombre = p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const porCat = !filtroCategoria || p.categoriaId === filtroCategoria
    const porEstado = !filtroEstado ||
      (filtroEstado === 'agotado' && p.stock === 0) ||
      (filtroEstado === 'bajo' && p.stock > 0 && p.stock <= p.stockMinimo) ||
      (filtroEstado === 'ok' && p.stock > p.stockMinimo)
    return porNombre && porCat && porEstado
  })

  const agotados = productosActivos.filter(p => p.stock === 0).length
  const bajoStock = productosActivos.filter(p => p.stock > 0 && p.stock <= p.stockMinimo).length
  const ok = productosActivos.filter(p => p.stock > p.stockMinimo).length

  const manejarGuardarStock = () => {
    if (nuevoStock === '' || isNaN(nuevoStock)) { toast('Ingresa una cantidad válida', 'error'); return }
    actualizarStock(editando.id, Number(nuevoStock))
    setEditando(null)
    setNuevoStock('')
    toast('Stock actualizado', 'exito')
  }

  const estadoInventario = (p) => {
    if (p.stock === 0) return { texto: 'Agotado', clase: 'bg-red-50 text-red-600' }
    if (p.stock <= p.stockMinimo) return { texto: 'Bajo stock', clase: 'bg-amber-50 text-amber-700' }
    return { texto: 'Disponible', clase: 'bg-emerald-50 text-emerald-700' }
  }

  return (
    <div className="animate-fade-in">
      <h1 className="font-bold text-xl text-marca-negro mb-6">Inventario</h1>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center cursor-pointer hover:bg-emerald-100 transition-colors" onClick={() => setFiltroEstado(filtroEstado === 'ok' ? '' : 'ok')}>
          <p className="text-2xl font-bold text-emerald-700">{ok}</p>
          <p className="text-xs text-emerald-600 mt-0.5">Disponibles</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center cursor-pointer hover:bg-amber-100 transition-colors" onClick={() => setFiltroEstado(filtroEstado === 'bajo' ? '' : 'bajo')}>
          <p className="text-2xl font-bold text-amber-700">{bajoStock}</p>
          <p className="text-xs text-amber-600 mt-0.5">Bajo stock</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-center cursor-pointer hover:bg-red-100 transition-colors" onClick={() => setFiltroEstado(filtroEstado === 'agotado' ? '' : 'agotado')}>
          <p className="text-2xl font-bold text-red-700">{agotados}</p>
          <p className="text-xs text-red-600 mt-0.5">Agotados</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-marca-texto-suave" />
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar..." className="input-campo pl-9" />
        </div>
        <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} className="input-campo w-auto">
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-tarjeta overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-marca-beige text-marca-texto-suave text-xs">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Producto</th>
                <th className="text-center px-4 py-3 font-medium">Stock</th>
                <th className="text-center px-4 py-3 font-medium hidden sm:table-cell">Mínimo</th>
                <th className="text-center px-4 py-3 font-medium">Estado</th>
                <th className="text-right px-4 py-3 font-medium">Editar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-marca-beige-borde">
              {filtrados.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-marca-texto-suave text-sm">Sin productos encontrados</td></tr>
              ) : (
                filtrados.map(p => {
                  const { texto, clase } = estadoInventario(p)
                  const cat = getCat(p.categoriaId)
                  return (
                    <tr key={p.id} className="hover:bg-marca-beige/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-marca-beige shrink-0">
                            {p.fotos?.[0] ? <img src={p.fotos[0]} alt="" className="w-full h-full object-cover" /> : <Package size={12} className="text-marca-beige-borde m-auto mt-2" />}
                          </div>
                          <div>
                            <p className="font-medium text-marca-negro text-xs">{p.nombre}</p>
                            <p className="text-[11px] text-marca-texto-suave">{cat?.nombre || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-marca-negro">{p.stock}</td>
                      <td className="px-4 py-3 text-center text-marca-texto-suave hidden sm:table-cell">{p.stockMinimo}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${clase}`}>{texto}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => { setEditando(p); setNuevoStock(String(p.stock)) }} className="w-7 h-7 rounded-lg hover:bg-marca-beige flex items-center justify-center text-marca-texto-suave ml-auto transition-colors">
                          <Edit2 size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal abierto={!!editando} onCerrar={() => setEditando(null)} titulo="Actualizar stock">
        {editando && (
          <div className="space-y-4">
            <p className="font-medium text-marca-negro">{editando.nombre}</p>
            <div>
              <label className="etiqueta">Stock actual: <strong>{editando.stock}</strong> unidades</label>
              <input
                type="number"
                min="0"
                value={nuevoStock}
                onChange={e => setNuevoStock(e.target.value)}
                className="input-campo"
                placeholder="Nueva cantidad"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditando(null)} className="flex-1 btn-outline py-3">Cancelar</button>
              <button onClick={manejarGuardarStock} className="flex-1 btn-primario py-3">Guardar</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
