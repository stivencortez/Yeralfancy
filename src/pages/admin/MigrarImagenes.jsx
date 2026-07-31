import { useState, useRef, useCallback } from 'react'
import { RefreshCw, Search, Play, CheckCircle2, XCircle, AlertTriangle, Loader2, Image as ImageIcon, ArrowRight } from 'lucide-react'
import { supabase, subirImagenTelegram } from '../../lib/supabase'
import { useAdminToast } from '../../layouts/LayoutAdmin'

/* ─── Constantes ─────────────────────────────────────────────────────────────── */

const MARCA_STORAGE = '/storage/v1/object/public/'
const MARCA_TELEGRAM = '/api/imagen/'

/* Tablas y campos que pueden contener URLs de imágenes.
   Para cada tabla listamos los campos que son strings simples o arrays/JSON
   que pueden incluir URLs de Storage. */
const TABLAS_CON_IMAGENES = [
  'productos',        // fotos (array), capa (obj con posible ref?)
  'categorias',       // imagen (string)
  'banners',          // imagen (string)
  'config',           // logo, logo_dark (strings)
  'pwa_intro_config', // puede tener imágenes
  'pwa_intro_banners', // puede tener imágenes
]

/* ─── Helpers ────────────────────────────────────────────────────────────────── */

/** Recorre cualquier estructura (obj/array) y entrega cada string via visitar;
 *  si visitar devuelve un string distinto, lo reemplaza. */
function recorrerStrings(valor, visitar) {
  if (typeof valor === 'string') return visitar(valor)
  if (Array.isArray(valor)) return valor.map(v => recorrerStrings(v, visitar))
  if (valor && typeof valor === 'object') {
    const out = {}
    for (const k of Object.keys(valor)) out[k] = recorrerStrings(valor[k], visitar)
    return out
  }
  return valor
}

/** Reúne todas las URLs del Storage encontradas en una fila, con metadatos. */
function extraerUrlsStorage(fila) {
  const urls = new Set()
  recorrerStrings(fila, s => {
    if (s.includes(MARCA_STORAGE)) urls.add(s)
    return s
  })
  return [...urls]
}

/** Nombre legible del archivo a partir de la URL del Storage. */
function nombreDeUrl(url) {
  const i = url.indexOf(MARCA_STORAGE)
  if (i === -1) return 'imagen'
  const partes = url.slice(i + MARCA_STORAGE.length).split('?')[0]
  return decodeURIComponent(partes.split('/').pop() || 'imagen')
}

/** Detecta el tipo MIME probable por la extensión. */
function tipoDeNombre(nombre) {
  const ext = nombre.split('.').pop()?.toLowerCase()
  return { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' }[ext] || 'image/jpeg'
}

/* ─── Componente ─────────────────────────────────────────────────────────────── */

export default function MigrarImagenes() {
  const toast = useAdminToast()

  // Estado del escaneo
  const [escaneando, setEscaneando] = useState(false)
  const [resultados, setResultados] = useState(null)
  // { urlsStorage: [{url, tabla, filaId, nombre}], totalTelegram, totalStorage }

  // Estado de la migración
  const [migrando, setMigrando] = useState(false)
  const [progreso, setProgreso] = useState({ actual: 0, total: 0 })
  const [log, setLog] = useState([])
  const [resumen, setResumen] = useState(null)

  const cancelarRef = useRef(false)
  const logRef = useRef(null)

  const agregarLog = useCallback((texto, tipo = 'info') => {
    setLog(prev => {
      const nuevo = [...prev, { texto, tipo, ts: Date.now() }]
      return nuevo
    })
    // Auto-scroll
    setTimeout(() => {
      if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
    }, 50)
  }, [])

  /* ─── Escanear ───────────────────────────────────────────────────────────── */
  const escanear = async () => {
    setEscaneando(true)
    setResultados(null)
    setResumen(null)
    setLog([])

    try {
      const urlsStorage = []
      let totalTelegram = 0
      let totalStorage = 0

      for (const tabla of TABLAS_CON_IMAGENES) {
        const { data, error } = await supabase.from(tabla).select('*')
        if (error) {
          console.warn(`[Migrar] Tabla ${tabla} omitida:`, error.message)
          continue
        }
        if (!data || data.length === 0) continue

        for (const fila of data) {
          // Contar URLs de Telegram existentes
          recorrerStrings(fila, s => {
            if (s.startsWith(MARCA_TELEGRAM)) totalTelegram++
            return s
          })

          // Extraer URLs del Storage
          const urls = extraerUrlsStorage(fila)
          totalStorage += urls.length
          for (const url of urls) {
            urlsStorage.push({
              url,
              tabla,
              filaId: fila.id,
              nombre: nombreDeUrl(url),
            })
          }
        }
      }

      setResultados({ urlsStorage, totalTelegram, totalStorage })

      if (urlsStorage.length === 0) {
        toast('No se encontraron imágenes en Storage para migrar', 'aviso')
      } else {
        toast(`Se encontraron ${urlsStorage.length} imágenes en Storage`, 'exito')
      }
    } catch (e) {
      console.error('[Migrar] Error al escanear:', e)
      toast('Error al escanear: ' + e.message, 'error')
    } finally {
      setEscaneando(false)
    }
  }

  /* ─── Migrar ─────────────────────────────────────────────────────────────── */
  const migrar = async () => {
    if (!resultados || resultados.urlsStorage.length === 0) return

    const ok = window.confirm(
      `Se migrarán ${resultados.urlsStorage.length} imágenes del Storage al Telegram.\n\n` +
      'Las imágenes originales del Storage NO se eliminan.\n' +
      '¿Continuar?'
    )
    if (!ok) return

    setMigrando(true)
    cancelarRef.current = false
    setLog([])
    setResumen(null)

    const total = resultados.urlsStorage.length
    setProgreso({ actual: 0, total })

    // Deduplicar URLs — la misma URL puede estar en varias filas
    const urlUnicas = [...new Set(resultados.urlsStorage.map(r => r.url))]
    const mapaReemplazos = {} // urlVieja → urlNueva
    let migradas = 0
    let fallidas = 0
    const fallos = []

    agregarLog(`Iniciando migración de ${urlUnicas.length} imágenes únicas...`)

    for (let i = 0; i < urlUnicas.length; i++) {
      if (cancelarRef.current) {
        agregarLog('⚠️ Migración cancelada por el usuario', 'warn')
        break
      }

      const url = urlUnicas[i]
      const nombre = nombreDeUrl(url)
      setProgreso({ actual: i + 1, total: urlUnicas.length })

      try {
        // 1. Descargar bytes originales del Storage (sin compresión)
        agregarLog(`⬇️ Descargando: ${nombre}`)
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status} al descargar`)
        const blob = await res.blob()

        if (!blob.type.startsWith('image/') && blob.type !== 'application/octet-stream') {
          throw new Error(`Tipo inesperado: ${blob.type}`)
        }

        // 2. Subir al Telegram (bytes originales, sin recompresión)
        agregarLog(`⬆️ Subiendo a Telegram: ${nombre} (${(blob.size / 1024).toFixed(0)} KB)`)
        const tipo = blob.type.startsWith('image/') ? blob.type : tipoDeNombre(nombre)
        const blobConTipo = new Blob([blob], { type: tipo })
        const nuevaUrl = await subirImagenTelegram(blobConTipo, nombre)

        mapaReemplazos[url] = nuevaUrl
        migradas++
        agregarLog(`✅ Migrada: ${nombre} → ${nuevaUrl}`, 'ok')
      } catch (e) {
        fallidas++
        fallos.push({ url, nombre, error: e.message })
        agregarLog(`❌ Error con ${nombre}: ${e.message}`, 'error')
      }
    }

    // 3. Actualizar las URLs en la base de datos
    if (Object.keys(mapaReemplazos).length > 0 && !cancelarRef.current) {
      agregarLog(`\n📝 Actualizando ${Object.keys(mapaReemplazos).length} URLs en la base de datos...`)

      // Agrupar por tabla + id de fila
      const filasPorTabla = {}
      for (const entry of resultados.urlsStorage) {
        if (!mapaReemplazos[entry.url]) continue // no fue migrada
        const key = `${entry.tabla}::${entry.filaId}`
        if (!filasPorTabla[key]) {
          filasPorTabla[key] = { tabla: entry.tabla, filaId: entry.filaId }
        }
      }

      for (const { tabla, filaId } of Object.values(filasPorTabla)) {
        try {
          // Leer la fila actual
          const { data, error } = await supabase.from(tabla).select('*').eq('id', filaId).single()
          if (error || !data) {
            agregarLog(`⚠️ No se pudo leer ${tabla} id=${filaId}: ${error?.message || 'sin datos'}`, 'warn')
            continue
          }

          // Reescribir URLs
          const actualizado = recorrerStrings(data, s => mapaReemplazos[s] || s)

          // Guardar
          const { error: errUpdate } = await supabase.from(tabla).upsert(actualizado)
          if (errUpdate) {
            agregarLog(`⚠️ Error actualizando ${tabla} id=${filaId}: ${errUpdate.message}`, 'warn')
          } else {
            agregarLog(`📝 Actualizado: ${tabla} → id=${filaId}`, 'ok')
          }
        } catch (e) {
          agregarLog(`⚠️ Error procesando ${tabla} id=${filaId}: ${e.message}`, 'warn')
        }
      }
    }

    const res = {
      migradas,
      fallidas,
      total: urlUnicas.length,
      cancelada: cancelarRef.current,
      fallos,
    }
    setResumen(res)

    if (cancelarRef.current) {
      agregarLog(`\n⚠️ Migración cancelada. ${migradas} migradas, ${fallidas} fallidas.`, 'warn')
      toast('Migración cancelada', 'aviso')
    } else if (fallidas > 0) {
      agregarLog(`\n⚠️ Migración completada con errores: ${migradas} OK, ${fallidas} fallidas.`, 'warn')
      toast(`Migración completada con ${fallidas} errores`, 'error')
    } else {
      agregarLog(`\n🎉 ¡Migración completa! ${migradas} imágenes migradas exitosamente.`, 'ok')
      toast('¡Todas las imágenes migradas a Telegram!', 'exito')
    }

    setMigrando(false)
  }

  const cancelar = () => {
    cancelarRef.current = true
  }

  const porcentaje = progreso.total > 0
    ? Math.round((progreso.actual / progreso.total) * 100)
    : 0

  const ocupado = escaneando || migrando

  return (
    <div className="animate-fade-in max-w-2xl space-y-5">

      {/* Título */}
      <div>
        <h1 className="text-xl font-bold text-marca-negro flex items-center gap-2">
          <RefreshCw size={20} className="text-marca-marron" /> Migrar imágenes a Telegram
        </h1>
        <p className="text-sm text-marca-texto-suave mt-1">
          Transfiere las imágenes almacenadas en Supabase Storage al canal de Telegram,
          manteniendo la <strong>calidad original</strong> de cada imagen.
        </p>
      </div>

      {/* Info */}
      <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-xl px-3 py-2.5">
        <ImageIcon size={14} className="shrink-0 mt-0.5" />
        <div>
          <strong>¿Cómo funciona?</strong> Las imágenes se descargan del Storage en su resolución original (sin recompresión) y se envían al canal de Telegram vía <code className="bg-blue-100 px-1 rounded">sendDocument</code>, que preserva los bytes exactos. Después, las URLs en la base de datos se actualizan automáticamente.
        </div>
      </div>

      {/* Paso 1: Escanear */}
      <div className="bg-white rounded-2xl border border-marca-beige-borde p-5">
        <h2 className="font-semibold text-marca-negro flex items-center gap-2 mb-1">
          <Search size={16} className="text-marca-marron" />
          Paso 1 — Escanear tablas
        </h2>
        <p className="text-xs text-marca-texto-suave mb-4">
          Revisa todas las tablas en busca de imágenes alojadas en el Storage de Supabase.
        </p>
        <button
          onClick={escanear}
          disabled={ocupado}
          className="btn-primario py-2.5 px-5 text-sm flex items-center gap-2 disabled:opacity-60"
        >
          {escaneando ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
          {escaneando ? 'Escaneando...' : 'Escanear imágenes'}
        </button>

        {/* Resultado del escaneo */}
        {resultados && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-center">
                <p className="text-2xl font-bold text-amber-700">{resultados.totalStorage}</p>
                <p className="text-[11px] text-amber-600 font-medium">En Storage (migrar)</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 text-center">
                <p className="text-2xl font-bold text-emerald-700">{resultados.totalTelegram}</p>
                <p className="text-[11px] text-emerald-600 font-medium">Ya en Telegram</p>
              </div>
            </div>

            {resultados.urlsStorage.length > 0 && (
              <div className="max-h-40 overflow-y-auto border border-marca-beige-borde rounded-xl">
                <table className="w-full text-xs">
                  <thead className="bg-marca-beige text-marca-texto-suave sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium">Imagen</th>
                      <th className="text-left px-3 py-2 font-medium">Tabla</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-marca-beige-borde">
                    {resultados.urlsStorage.map((r, i) => (
                      <tr key={`${r.url}-${i}`} className="hover:bg-marca-beige/30">
                        <td className="px-3 py-1.5 text-marca-negro truncate max-w-[200px]" title={r.url}>{r.nombre}</td>
                        <td className="px-3 py-1.5 text-marca-texto-suave">{r.tabla}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Paso 2: Migrar */}
      {resultados && resultados.urlsStorage.length > 0 && (
        <div className="bg-white rounded-2xl border border-marca-beige-borde p-5">
          <h2 className="font-semibold text-marca-negro flex items-center gap-2 mb-1">
            <ArrowRight size={16} className="text-marca-marron" />
            Paso 2 — Migrar a Telegram
          </h2>
          <p className="text-xs text-marca-texto-suave mb-3">
            Descarga cada imagen del Storage y la sube al canal de Telegram, luego actualiza las URLs en la base de datos.
          </p>

          {/* Aviso */}
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl px-3 py-2.5 mb-4">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>Las imágenes en Storage <strong>no se eliminan</strong> automáticamente. Puedes limpiarlas después manualmente.</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={migrar}
              disabled={ocupado}
              className="btn-primario py-2.5 px-5 text-sm flex items-center gap-2 disabled:opacity-60"
            >
              {migrando ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
              {migrando ? 'Migrando...' : 'Migrar todas las imágenes'}
            </button>
            {migrando && (
              <button
                onClick={cancelar}
                className="btn-outline py-2.5 px-5 text-sm flex items-center gap-2 text-red-500 border-red-200 hover:bg-red-50"
              >
                <XCircle size={15} /> Cancelar
              </button>
            )}
          </div>

          {/* Barra de progreso */}
          {migrando && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-marca-texto-suave mb-1">
                <span>Progreso: {progreso.actual} de {progreso.total}</span>
                <span>{porcentaje}%</span>
              </div>
              <div className="w-full h-2.5 bg-marca-beige rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-marca-marron to-marca-marron-oscuro rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${porcentaje}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Log */}
      {log.length > 0 && (
        <div className="bg-white rounded-2xl border border-marca-beige-borde p-4">
          <h3 className="font-semibold text-marca-negro text-sm mb-2">Registro de actividad</h3>
          <div
            ref={logRef}
            className="max-h-60 overflow-y-auto bg-gray-50 rounded-xl p-3 font-mono text-[11px] leading-relaxed space-y-0.5"
          >
            {log.map((entrada, i) => (
              <div
                key={i}
                className={
                  entrada.tipo === 'ok' ? 'text-emerald-700' :
                  entrada.tipo === 'error' ? 'text-red-600' :
                  entrada.tipo === 'warn' ? 'text-amber-700' :
                  'text-gray-600'
                }
              >
                {entrada.texto}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resumen final */}
      {resumen && (
        <div className={`flex items-start gap-2 text-sm rounded-xl px-4 py-3 border ${
          resumen.fallidas > 0 || resumen.cancelada
            ? 'bg-amber-50 border-amber-200 text-amber-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {resumen.fallidas > 0 || resumen.cancelada
            ? <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            : <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
          }
          <div>
            <p className="font-semibold">
              {resumen.cancelada ? 'Migración cancelada' :
               resumen.fallidas > 0 ? 'Migración completada con errores' :
               '¡Migración exitosa!'}
            </p>
            <p className="text-xs mt-0.5">
              {resumen.migradas} imágenes migradas a Telegram
              {resumen.fallidas > 0 && `, ${resumen.fallidas} fallidas`}
              {' de '}{resumen.total} totales.
            </p>
            {resumen.fallos.length > 0 && (
              <details className="mt-2">
                <summary className="text-xs cursor-pointer hover:underline">Ver imágenes fallidas</summary>
                <ul className="mt-1 text-xs space-y-0.5">
                  {resumen.fallos.map((f, i) => (
                    <li key={i}>• {f.nombre}: {f.error}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
