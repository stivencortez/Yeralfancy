import { useRef, useState, useCallback } from 'react'
import {
  FileSpreadsheet, Upload, CheckCircle2, AlertTriangle, XCircle,
  RefreshCw, Info, Loader2, PackagePlus, BarChart3,
  FileCheck2, History, X,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProductos } from '../../store/useProductos'
import { useCategorias } from '../../store/useCategorias'
import { supabase } from '../../lib/supabase'
import { generarId, formatearPrecio, formatearFechaHora } from '../../utils/formatear'
import { parseInventoryExcel } from '../../utils/parseInventoryExcel'
import { useAdminToast } from '../../layouts/LayoutAdmin'

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes) {
  if (bytes < 1024)         return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function BadgeEstado({ estado }) {
  const cls = {
    valido:      'bg-emerald-50 text-emerald-700',
    advertencia: 'bg-amber-50 text-amber-700',
    error:       'bg-red-50 text-red-600',
  }[estado] || 'bg-gray-100 text-gray-500'

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${cls}`}>
      {estado === 'valido'      && <CheckCircle2  size={10} />}
      {estado === 'advertencia' && <AlertTriangle size={10} />}
      {estado === 'error'       && <XCircle       size={10} />}
      {{ valido: 'Válido', advertencia: 'Aviso', error: 'Error' }[estado]}
    </span>
  )
}

function BadgeAccion({ accion }) {
  const cfg = {
    crear:      { cls: 'bg-marca-beige text-marca-marron',    label: 'Crear' },
    actualizar: { cls: 'bg-amber-50 text-amber-700',          label: 'Actualizar' },
    ignorar:    { cls: 'bg-red-50 text-red-500',              label: 'Ignorar' },
  }
  const { cls, label } = cfg[accion] || cfg.crear
  return <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-medium ${cls}`}>{label}</span>
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function ImportarExcel() {
  const toast = useAdminToast()

  const productos         = useProductos(s => s.productos)
  const agregarProducto   = useProductos(s => s.agregarProducto)
  const editarProducto    = useProductos(s => s.editarProducto)

  const categorias        = useCategorias(s => s.categorias)
  const agregarCategoria  = useCategorias(s => s.agregarCategoria)

  const inputRef = useRef(null)

  const [archivo,        setArchivo]        = useState(null)
  const [leyendo,        setLeyendo]        = useState(false)
  const [dragActivo,     setDragActivo]     = useState(false)
  const [parseado,       setParseado]       = useState(null)
  const [enriquecidos,   setEnriquecidos]   = useState([])
  const [importando,     setImportando]     = useState(false)
  const [resultado,      setResultado]      = useState(null)
  const [mostrarResult,  setMostrarResult]  = useState(false)
  const [historial,      setHistorial]      = useState([])
  const [mostrarHist,    setMostrarHist]    = useState(false)
  const [cargandoHist,   setCargandoHist]   = useState(false)
  const [paginaTabla,    setPaginaTabla]    = useState(0)
  const POR_PAGINA = 20

  // ── historial ────────────────────────────────────────────────────────────

  const cargarHistorial = useCallback(async () => {
    setCargandoHist(true)
    try {
      const { data } = await supabase
        .from('importaciones_productos')
        .select('*')
        .order('creado_en', { ascending: false })
        .limit(10)
      setHistorial(data || [])
    } catch (_) { /* tabla puede no existir aún */ } finally {
      setCargandoHist(false)
    }
  }, [])

  // ── leer archivo ─────────────────────────────────────────────────────────

  const leerArchivo = useCallback(async (file) => {
    if (!file) return
    if (!file.name.match(/\.xlsx?$/i)) { toast('Solo se aceptan archivos .xlsx', 'error'); return }
    if (file.size > 10 * 1024 * 1024) { toast('El archivo supera el límite de 10 MB.', 'error'); return }

    setLeyendo(true)
    setParseado(null)
    setEnriquecidos([])
    setResultado(null)
    setMostrarResult(false)
    setPaginaTabla(0)

    try {
      const buffer = await file.arrayBuffer()
      const result = parseInventoryExcel(buffer)

      if (result.productos.length === 0) {
        toast(result.errors[0]?.mensaje || 'No se encontraron productos.', 'error')
        setLeyendo(false)
        return
      }

      // enriquecer con acción esperada
      const enriq = result.productos.map(p => {
        if (p._estado === 'error') return { ...p, _accion: 'ignorar', _idExistente: null }
        const catId = p.categoria
          ? categorias.find(c => c.nombre.toLowerCase() === p.categoria.toLowerCase())?.id
          : null
        const existe = productos.find(prod =>
          prod.nombre.toLowerCase() === p.nombre.toLowerCase() &&
          (catId ? prod.categoriaId === catId : !prod.categoriaId)
        )
        return { ...p, _accion: existe ? 'actualizar' : 'crear', _idExistente: existe?.id ?? null }
      })

      setEnriquecidos(enriq)
      setParseado(result)
      toast(`Archivo leído: ${result.summary.total} producto(s) encontrado(s).`, 'exito')
    } catch (e) {
      toast('Error al leer el archivo: ' + e.message, 'error')
    } finally {
      setLeyendo(false)
    }
  }, [categorias, productos, toast])

  const manejarInput = (e) => {
    const f = e.target.files?.[0]
    if (f) { setArchivo(f); leerArchivo(f) }
    e.target.value = ''
  }

  const manejarDrop = (e) => {
    e.preventDefault()
    setDragActivo(false)
    const f = e.dataTransfer.files?.[0]
    if (f) { setArchivo(f); leerArchivo(f) }
  }

  // ── importar ─────────────────────────────────────────────────────────────

  const importar = useCallback(async () => {
    if (!enriquecidos.length) return
    setImportando(true)

    let creados = 0, actualizados = 0, ignorados = 0, categoriasCreadas = 0
    const erroresImport = []
    const mapaCategoria = Object.fromEntries(
      categorias.map(c => [c.nombre.toLowerCase(), c.id])
    )

    for (const p of enriquecidos) {
      if (p._accion === 'ignorar') { ignorados++; continue }

      try {
        let categoriaId = null
        if (p.categoria) {
          const claveCat = p.categoria.toLowerCase()
          if (mapaCategoria[claveCat]) {
            categoriaId = mapaCategoria[claveCat]
          } else {
            const nueva = await agregarCategoria({
              nombre:      p.categoria,
              descripcion: '',
              imagen:      '',
              activa:      true,
              orden:       Object.keys(mapaCategoria).length,
            })
            mapaCategoria[claveCat] = nueva.id
            categoriaId             = nueva.id
            categoriasCreadas++
          }
        }

        const datosProducto = {
          nombre:      p.nombre,
          descripcion: p.notas || '',
          categoriaId,
          precioCosto: p.precioCosto,
          precioVenta: p.precioVenta,
          stock:       p.stock,
          stockMinimo: 3,
          fotos:       [],
          destacado:   false,
          activo:      true,
        }

        if (p._accion === 'actualizar' && p._idExistente) {
          const existente = productos.find(pr => pr.id === p._idExistente)
          await editarProducto(p._idExistente, {
            ...datosProducto,
            destacado: existente?.destacado ?? false,
            fotos:     existente?.fotos     ?? [],
          })
          actualizados++
        } else {
          await agregarProducto(datosProducto)
          creados++
        }
      } catch (e) {
        erroresImport.push({ fila: p._fila, mensaje: e.message })
        ignorados++
      }
    }

    // historial (best-effort)
    try {
      await supabase.from('importaciones_productos').insert({
        id:                     generarId(),
        archivo_nombre:         archivo?.name || 'desconocido',
        total_filas:            enriquecidos.length,
        productos_creados:      creados,
        productos_actualizados: actualizados,
        productos_ignorados:    ignorados,
        categorias_creadas:     categoriasCreadas,
        estado:                 erroresImport.length === 0 ? 'completado' : 'con_errores',
        errores:                erroresImport.length > 0 ? JSON.stringify(erroresImport) : null,
        creado_en:              new Date().toISOString(),
      })
    } catch (_) { /* historial opcional */ }

    setResultado({ creados, actualizados, ignorados, categoriasCreadas, errores: erroresImport })
    setMostrarResult(true)
    setImportando(false)
    toast(`Importación completada: ${creados} creados, ${actualizados} actualizados.`, 'exito')
  }, [enriquecidos, categorias, productos, archivo, agregarProducto, editarProducto, agregarCategoria, toast])

  // ── reset ─────────────────────────────────────────────────────────────────

  const reiniciar = () => {
    setArchivo(null)
    setParseado(null)
    setEnriquecidos([])
    setResultado(null)
    setMostrarResult(false)
    setPaginaTabla(0)
  }

  // ── conteos ───────────────────────────────────────────────────────────────

  const totalACrear      = enriquecidos.filter(p => p._accion === 'crear').length
  const totalAActualizar = enriquecidos.filter(p => p._accion === 'actualizar').length
  const totalAIgnorar    = enriquecidos.filter(p => p._accion === 'ignorar').length
  const catNuevas        = parseado
    ? parseado.summary.categorias.filter(c =>
        !categorias.some(cat => cat.nombre.toLowerCase() === c.toLowerCase())
      ).length
    : 0

  const totalPaginas    = Math.ceil(enriquecidos.length / POR_PAGINA)
  const productosPagina = enriquecidos.slice(paginaTabla * POR_PAGINA, (paginaTabla + 1) * POR_PAGINA)

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="animate-fade-in">

      {/* ── Encabezado ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-bold text-xl text-marca-negro">Importar productos desde Excel</h1>
          <p className="text-sm text-marca-texto-suave mt-1">
            Sube un archivo de inventario para registrar o actualizar productos automáticamente.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {parseado && (
            <button onClick={reiniciar} className="btn-outline text-xs flex items-center gap-1.5 py-2 px-3">
              <RefreshCw size={13} /> Reiniciar
            </button>
          )}
          <button
            onClick={() => { setMostrarHist(v => !v); if (!mostrarHist) cargarHistorial() }}
            className="btn-outline text-xs flex items-center gap-1.5 py-2 px-3"
          >
            <History size={13} /> Historial
          </button>
        </div>
      </div>

      {/* ── Historial ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mostrarHist && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-5"
          >
            <div className="bg-white rounded-2xl shadow-tarjeta p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-sm text-marca-negro flex items-center gap-2">
                  <History size={15} className="text-marca-marron" /> Últimas importaciones
                </h2>
                <button onClick={() => setMostrarHist(false)} className="text-marca-texto-suave hover:text-marca-negro transition-colors">
                  <X size={14} />
                </button>
              </div>

              {cargandoHist ? (
                <div className="flex items-center gap-2 text-marca-texto-suave text-sm py-4">
                  <Loader2 size={15} className="animate-spin" /> Cargando...
                </div>
              ) : historial.length === 0 ? (
                <p className="text-sm text-marca-texto-suave py-2">
                  No hay importaciones registradas todavía.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-marca-beige text-marca-texto-suave text-xs">
                      <tr>
                        {['Fecha', 'Archivo', 'Creados', 'Actualizados', 'Ignorados', 'Categorías', 'Estado'].map(h => (
                          <th key={h} className="text-left px-3 py-2 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-marca-beige-borde">
                      {historial.map(h => (
                        <tr key={h.id} className="hover:bg-marca-beige/30 transition-colors">
                          <td className="px-3 py-2 text-xs text-marca-texto-suave whitespace-nowrap">{formatearFechaHora(h.creado_en)}</td>
                          <td className="px-3 py-2 text-xs font-medium max-w-[160px] truncate">{h.archivo_nombre}</td>
                          <td className="px-3 py-2 text-center"><span className="bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full">{h.productos_creados}</span></td>
                          <td className="px-3 py-2 text-center"><span className="bg-amber-50 text-amber-700 text-xs px-2 py-0.5 rounded-full">{h.productos_actualizados}</span></td>
                          <td className="px-3 py-2 text-center text-xs text-marca-texto-suave">{h.productos_ignorados}</td>
                          <td className="px-3 py-2 text-center text-xs">{h.categorias_creadas}</td>
                          <td className="px-3 py-2">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${h.estado === 'completado' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                              {h.estado === 'completado' ? 'Completado' : 'Con errores'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Layout principal ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Columna izquierda ────────────────────────────────────────── */}
        <div className="lg:col-span-1 flex flex-col gap-4">

          {/* Card subida */}
          <div className="bg-white rounded-2xl shadow-tarjeta p-5">
            <h2 className="font-semibold text-sm text-marca-negro flex items-center gap-2 mb-4">
              <Upload size={15} className="text-marca-marron" /> Subir archivo
            </h2>

            <div
              onDrop={manejarDrop}
              onDragOver={e => { e.preventDefault(); setDragActivo(true) }}
              onDragLeave={() => setDragActivo(false)}
              onClick={() => !leyendo && inputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 py-8 px-4 cursor-pointer transition-all duration-200
                ${dragActivo
                  ? 'border-marca-marron bg-marca-beige/60 scale-[1.01]'
                  : 'border-marca-beige-borde hover:border-marca-marron hover:bg-marca-beige/40'
                }
                ${leyendo ? 'pointer-events-none opacity-70' : ''}`}
            >
              {leyendo ? (
                <>
                  <Loader2 size={28} className="text-marca-marron animate-spin" />
                  <span className="text-sm text-marca-texto-suave">Leyendo archivo...</span>
                </>
              ) : archivo ? (
                <>
                  <FileCheck2 size={28} className="text-emerald-500" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-marca-negro truncate max-w-[180px]">{archivo.name}</p>
                    <p className="text-xs text-marca-texto-suave mt-0.5">{formatBytes(archivo.size)}</p>
                  </div>
                  <span className="text-xs text-marca-marron font-medium">Haz clic para cambiar archivo</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet size={28} className="text-marca-marron" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-marca-negro">Arrastra tu archivo aquí</p>
                    <p className="text-xs text-marca-texto-suave mt-0.5">o haz clic para seleccionar</p>
                  </div>
                  <span className="text-xs text-marca-texto-suave bg-marca-beige px-3 py-1 rounded-full">.xlsx — máx. 10 MB</span>
                </>
              )}
            </div>

            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={manejarInput}
            />
          </div>

          {/* Instrucciones */}
          <div className="bg-white rounded-2xl shadow-tarjeta p-5">
            <h2 className="font-semibold text-sm text-marca-negro flex items-center gap-2 mb-3">
              <Info size={15} className="text-marca-marron" /> Columnas esperadas
            </h2>
            <div className="space-y-2.5">
              {[
                { col: 'Nombre',          desc: 'Obligatorio',          cls: 'bg-red-50 text-red-600' },
                { col: 'Categoría',       desc: 'Se crea si no existe', cls: 'bg-amber-50 text-amber-700' },
                { col: 'Cant.',           desc: 'Stock disponible',     cls: 'bg-emerald-50 text-emerald-700' },
                { col: 'Costo unitario',  desc: 'Precio de costo',      cls: 'bg-emerald-50 text-emerald-700' },
                { col: 'Precio unitario', desc: 'Precio de venta',      cls: 'bg-emerald-50 text-emerald-700' },
                { col: 'Notas',           desc: 'Referencia / SKU',     cls: 'bg-marca-beige text-marca-marron' },
              ].map(({ col, desc, cls }) => (
                <div key={col} className="flex items-center justify-between text-xs">
                  <span className="font-mono font-medium text-marca-negro">{col}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${cls}`}>{desc}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-marca-texto-suave mt-3 pt-3 border-t border-marca-beige-borde">
              Los encabezados pueden estar en cualquier fila. El sistema los detecta automáticamente aunque haya filas de resumen arriba.
            </p>
          </div>
        </div>

        {/* ── Columna derecha ──────────────────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Estado vacío */}
          {!parseado && !leyendo && (
            <div className="bg-white rounded-2xl shadow-tarjeta p-12 flex flex-col items-center justify-center gap-3 text-center">
              <FileSpreadsheet size={44} className="text-marca-beige-borde" />
              <p className="text-sm text-marca-texto-suave">
                Sube un archivo Excel para ver la vista previa aquí.
              </p>
              <p className="text-xs text-marca-texto-suave max-w-xs">
                Los productos serán detectados, categorizados y validados antes de importar.
              </p>
            </div>
          )}

          {parseado && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { valor: parseado.summary.total,          label: 'Total',          bg: 'bg-marca-beige',    color: 'text-marca-negro' },
                  { valor: parseado.summary.validos,         label: 'Válidos',        bg: 'bg-emerald-50',    color: 'text-emerald-700' },
                  { valor: parseado.summary.conAdvertencias, label: 'Advertencias',   bg: 'bg-amber-50',      color: 'text-amber-700' },
                  { valor: parseado.summary.conErrores,      label: 'Con errores',    bg: 'bg-red-50',        color: 'text-red-600' },
                ].map(({ valor, label, bg, color }) => (
                  <div key={label} className={`${bg} rounded-2xl p-4 text-center`}>
                    <p className={`text-2xl font-bold ${color}`}>{valor}</p>
                    <p className="text-xs text-marca-texto-suave mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {/* Resumen de acciones */}
              <div className="bg-white rounded-2xl shadow-tarjeta p-4">
                <h2 className="font-semibold text-sm text-marca-negro mb-3 flex items-center gap-2">
                  <BarChart3 size={14} className="text-marca-marron" /> Acciones que se realizarán
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  {[
                    { label: 'Productos nuevos',  valor: totalACrear,      cls: 'text-marca-marron' },
                    { label: 'A actualizar',       valor: totalAActualizar, cls: 'text-amber-700' },
                    { label: 'A ignorar',          valor: totalAIgnorar,    cls: 'text-red-500' },
                    { label: 'Categorías nuevas',  valor: catNuevas,        cls: 'text-emerald-600' },
                  ].map(({ label, valor, cls }) => (
                    <div key={label} className="bg-marca-beige/50 rounded-xl p-3">
                      <p className={`text-2xl font-bold ${cls}`}>{valor}</p>
                      <p className="text-xs text-marca-texto-suave mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tabla vista previa */}
              <div className="bg-white rounded-2xl shadow-tarjeta overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-marca-beige-borde">
                  <h2 className="font-semibold text-sm text-marca-negro">Vista previa de productos</h2>
                  <span className="text-xs text-marca-texto-suave">{enriquecidos.length} producto(s)</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-marca-beige text-marca-texto-suave text-xs">
                      <tr>
                        {['Estado', 'Nombre', 'Categoría', 'Stock', 'Costo', 'Precio', 'Ganancia', 'Notas', 'Acción'].map(h => (
                          <th key={h} className="text-left px-3 py-2.5 font-medium whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-marca-beige-borde">
                      {productosPagina.map((p, i) => (
                        <tr
                          key={`${p._fila}-${i}`}
                          className={`hover:bg-marca-beige/30 transition-colors ${p._estado === 'error' ? 'opacity-60' : ''}`}
                        >
                          <td className="px-3 py-2.5"><BadgeEstado estado={p._estado} /></td>
                          <td className="px-3 py-2.5 max-w-[150px]">
                            <span className="font-medium text-marca-negro text-xs block truncate" title={p.nombre}>{p.nombre || '—'}</span>
                            {p._mensajes?.length > 0 && (
                              <span className="text-amber-600 text-[10px] block leading-tight mt-0.5">{p._mensajes[0]}</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-xs text-marca-texto-suave whitespace-nowrap">{p.categoria || '—'}</td>
                          <td className="px-3 py-2.5 text-xs text-center font-medium text-marca-negro">{p.stock ?? 0}</td>
                          <td className="px-3 py-2.5 text-xs text-right text-marca-texto-suave">{formatearPrecio(p.precioCosto ?? 0)}</td>
                          <td className="px-3 py-2.5 text-xs text-right">
                            <span className={p.precioVenta === 0 ? 'text-amber-500' : 'text-marca-negro font-medium'}>
                              {formatearPrecio(p.precioVenta ?? 0)}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-xs text-right">
                            <span className={p.gananciaUnidad < 0 ? 'text-red-500' : 'text-emerald-600 font-medium'}>
                              {formatearPrecio(p.gananciaUnidad ?? 0)}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-xs text-marca-texto-suave max-w-[90px]">
                            <span className="block truncate" title={p.notas}>{p.notas || '—'}</span>
                          </td>
                          <td className="px-3 py-2.5"><BadgeAccion accion={p._accion} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {totalPaginas > 1 && (
                  <div className="flex items-center justify-between px-4 py-2.5 border-t border-marca-beige-borde">
                    <button
                      onClick={() => setPaginaTabla(p => Math.max(0, p - 1))}
                      disabled={paginaTabla === 0}
                      className="btn-outline text-xs py-1.5 px-3 disabled:opacity-40"
                    >
                      Anterior
                    </button>
                    <span className="text-xs text-marca-texto-suave">
                      Página {paginaTabla + 1} de {totalPaginas}
                    </span>
                    <button
                      onClick={() => setPaginaTabla(p => Math.min(totalPaginas - 1, p + 1))}
                      disabled={paginaTabla === totalPaginas - 1}
                      className="btn-outline text-xs py-1.5 px-3 disabled:opacity-40"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </div>

              {/* Errores del parser */}
              {parseado.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                  <h3 className="text-sm font-semibold text-red-600 flex items-center gap-2 mb-2">
                    <XCircle size={14} /> Errores detectados en el archivo
                  </h3>
                  <ul className="space-y-1">
                    {parseado.errors.map((e, i) => (
                      <li key={i} className="text-xs text-red-500">{e.mensaje}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Advertencias */}
              {parseado.warnings.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <h3 className="text-sm font-semibold text-amber-700 flex items-center gap-2 mb-2">
                    <AlertTriangle size={14} /> Advertencias ({parseado.warnings.length})
                  </h3>
                  <ul className="space-y-1 max-h-32 overflow-y-auto">
                    {parseado.warnings.map((w, i) => (
                      <li key={i} className="text-xs text-amber-700">{w.mensaje}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-3">
                <button onClick={reiniciar} className="btn-outline flex-1 py-3">
                  Cancelar
                </button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={importar}
                  disabled={importando || (totalACrear + totalAActualizar === 0)}
                  className="btn-primario flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {importando ? (
                    <><Loader2 size={16} className="animate-spin" /> Importando...</>
                  ) : (
                    <><PackagePlus size={16} /> Confirmar importación</>
                  )}
                </motion.button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Modal resultado ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {mostrarResult && resultado && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1,    opacity: 1 }}
              exit={{    scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              className="bg-white rounded-2xl shadow-modal w-full max-w-md p-6"
            >
              <div className="flex flex-col items-center text-center gap-3 mb-6">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 size={28} className="text-emerald-600" />
                </div>
                <h2 className="text-lg font-bold text-marca-negro">¡Importación completada!</h2>
                <p className="text-sm text-marca-texto-suave">Resumen de los resultados obtenidos.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: 'Productos creados',      valor: resultado.creados,           bg: 'bg-emerald-50',  color: 'text-emerald-700' },
                  { label: 'Productos actualizados', valor: resultado.actualizados,      bg: 'bg-amber-50',    color: 'text-amber-700' },
                  { label: 'Categorías creadas',     valor: resultado.categoriasCreadas, bg: 'bg-marca-beige', color: 'text-marca-marron' },
                  { label: 'Ignorados / errores',    valor: resultado.ignorados,         bg: 'bg-red-50',      color: 'text-red-500' },
                ].map(({ label, valor, bg, color }) => (
                  <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                    <p className={`text-2xl font-bold ${color}`}>{valor}</p>
                    <p className="text-xs text-marca-texto-suave mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              {resultado.errores?.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-xs font-semibold text-red-600 mb-1">Errores durante la importación:</p>
                  <ul className="space-y-0.5">
                    {resultado.errores.slice(0, 5).map((e, i) => (
                      <li key={i} className="text-xs text-red-500">{e.mensaje}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={() => { setMostrarResult(false); reiniciar() }}
                className="btn-primario w-full py-3"
              >
                Cerrar y reiniciar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
