import { useRef, useState } from 'react'
import JSZip from 'jszip'
import { Database, Download, Upload, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAdminToast } from '../../layouts/LayoutAdmin'

/* Tablas incluidas en el respaldo, en orden seguro de restauración
   (categorías antes que productos, clientes antes que pedidos, etc.) */
const TABLAS = [
  'config',
  'categorias',
  'productos',
  'clientes',
  'pedidos',
  'cupones',
  'banners',
  'pwa_intro_config',
  'pwa_intro_banners',
]

const MARCA_STORAGE = '/storage/v1/object/public/'
const VERSION_RESPALDO = 1
const TAM_LOTE = 200

/* Recorre cualquier estructura (obj/array) y entrega cada string via visitar;
   si visitar devuelve un string distinto, lo reemplaza (para reescribir URLs). */
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

function rutaDeUrl(url) {
  const i = url.indexOf(MARCA_STORAGE)
  if (i === -1) return null
  const resto = url.slice(i + MARCA_STORAGE.length).split('?')[0]
  const [bucket, ...partes] = resto.split('/')
  if (!bucket || partes.length === 0) return null
  return { bucket, nombre: decodeURIComponent(partes.join('/')) }
}

function tipoDeNombre(nombre) {
  const ext = nombre.split('.').pop()?.toLowerCase()
  return { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml' }[ext] || 'application/octet-stream'
}

export default function Respaldo() {
  const toast = useAdminToast()
  const inputRef = useRef(null)
  const [exportando, setExportando] = useState(false)
  const [importando, setImportando] = useState(false)
  const [progreso, setProgreso] = useState('')
  const [resumen, setResumen] = useState(null)

  /* ─── Exportar ──────────────────────────────────────────────────────────── */
  const exportar = async () => {
    setExportando(true)
    setResumen(null)
    try {
      // 1. Descargar todas las tablas
      const tablas = {}
      for (const t of TABLAS) {
        setProgreso(`Leyendo tabla ${t}...`)
        const { data, error } = await supabase.from(t).select('*')
        if (error) {
          console.warn(`[Respaldo] Tabla ${t} omitida:`, error.message)
          continue
        }
        tablas[t] = data || []
      }

      // 2. Reunir todas las URLs de imágenes del Storage
      const urls = new Set()
      recorrerStrings(tablas, s => {
        if (s.includes(MARCA_STORAGE)) urls.add(s)
        return s
      })

      // 3. Descargar cada imagen al zip
      const zip = new JSZip()
      const mapa = {}
      let n = 0, fallidas = 0
      for (const url of urls) {
        n += 1
        setProgreso(`Descargando imagen ${n} de ${urls.size}...`)
        const ruta = rutaDeUrl(url)
        if (!ruta) continue
        try {
          const res = await fetch(url)
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const blob = await res.blob()
          const archivo = `imagenes/${ruta.bucket}/${ruta.nombre}`
          zip.file(archivo, blob)
          mapa[url] = { archivo, bucket: ruta.bucket, nombre: ruta.nombre }
        } catch (e) {
          fallidas += 1
          console.warn('[Respaldo] No se pudo descargar', url, e)
        }
      }

      // 4. Armar el JSON y descargar el zip
      setProgreso('Comprimiendo respaldo...')
      const json = {
        version: VERSION_RESPALDO,
        app: 'yeral-fancy',
        fecha: new Date().toISOString(),
        tablas,
        imagenes: mapa,
      }
      zip.file('respaldo.json', JSON.stringify(json, null, 2))
      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })

      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `respaldo-yeralfancy-${new Date().toISOString().slice(0, 10)}.zip`
      a.click()
      URL.revokeObjectURL(a.href)

      const filas = Object.values(tablas).reduce((acc, rows) => acc + rows.length, 0)
      setResumen({
        tipo: 'exportar',
        texto: `Respaldo creado: ${filas} registros en ${Object.keys(tablas).length} tablas y ${Object.keys(mapa).length} imágenes.${fallidas ? ` (${fallidas} imágenes no se pudieron descargar)` : ''}`,
      })
      toast('Respaldo descargado', 'exito')
    } catch (e) {
      console.error('[Respaldo] Error al exportar:', e)
      toast('Error al crear el respaldo: ' + e.message, 'error')
    } finally {
      setExportando(false)
      setProgreso('')
    }
  }

  /* ─── Restaurar ─────────────────────────────────────────────────────────── */
  const restaurar = async (archivo) => {
    if (!archivo) return
    const ok = window.confirm(
      'Restaurar un respaldo SOBRESCRIBE los datos actuales con los del archivo (los registros con el mismo código se reemplazan). ¿Continuar?'
    )
    if (!ok) return

    setImportando(true)
    setResumen(null)
    try {
      setProgreso('Leyendo archivo...')
      const zip = await JSZip.loadAsync(archivo)
      const entrada = zip.file('respaldo.json')
      if (!entrada) throw new Error('El archivo no es un respaldo válido (falta respaldo.json).')
      const json = JSON.parse(await entrada.async('string'))
      if (json.app !== 'yeral-fancy') throw new Error('El respaldo no corresponde a esta aplicación.')

      // 1. Subir imágenes al Storage y construir el mapa URL vieja → URL nueva
      const reemplazos = {}
      const entradasImg = Object.entries(json.imagenes || {})
      let n = 0, imgFallidas = 0
      for (const [urlVieja, info] of entradasImg) {
        n += 1
        setProgreso(`Subiendo imagen ${n} de ${entradasImg.length}...`)
        const f = zip.file(info.archivo)
        if (!f) { imgFallidas += 1; continue }
        try {
          const blob = await f.async('blob')
          const { error } = await supabase.storage
            .from(info.bucket)
            .upload(info.nombre, blob, { upsert: true, contentType: tipoDeNombre(info.nombre) })
          if (error && !`${error.message}`.toLowerCase().includes('exists')) throw error
          const { data: pub } = supabase.storage.from(info.bucket).getPublicUrl(info.nombre)
          if (pub?.publicUrl) reemplazos[urlVieja] = pub.publicUrl
        } catch (e) {
          imgFallidas += 1
          console.warn('[Respaldo] No se pudo subir', info.archivo, e)
        }
      }

      // 2. Reescribir URLs y restaurar tabla por tabla
      let filas = 0
      const tablasFallidas = []
      for (const t of TABLAS) {
        const rows = json.tablas?.[t]
        if (!rows || rows.length === 0) continue
        setProgreso(`Restaurando ${t} (${rows.length} registros)...`)
        const corregidas = rows.map(r => recorrerStrings(r, s => reemplazos[s] || s))
        let errorTabla = null
        for (let i = 0; i < corregidas.length; i += TAM_LOTE) {
          const lote = corregidas.slice(i, i + TAM_LOTE)
          const { error } = await supabase.from(t).upsert(lote)
          if (error) { errorTabla = error; break }
        }
        if (errorTabla) {
          console.warn(`[Respaldo] Error restaurando ${t}:`, errorTabla.message)
          tablasFallidas.push(t)
        } else {
          filas += corregidas.length
        }
      }

      setResumen({
        tipo: 'importar',
        texto: `Restauración completa: ${filas} registros y ${Object.keys(reemplazos).length} imágenes.${imgFallidas ? ` (${imgFallidas} imágenes fallaron)` : ''}${tablasFallidas.length ? ` Tablas con error: ${tablasFallidas.join(', ')}.` : ''}`,
      })
      toast(tablasFallidas.length ? 'Restauración con avisos' : 'Respaldo restaurado', tablasFallidas.length ? 'error' : 'exito')
      setTimeout(() => window.location.reload(), 2500)
    } catch (e) {
      console.error('[Respaldo] Error al restaurar:', e)
      toast('Error al restaurar: ' + e.message, 'error')
    } finally {
      setImportando(false)
      setProgreso('')
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const ocupado = exportando || importando

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-marca-negro flex items-center gap-2">
          <Database size={20} className="text-marca-marron" /> Respaldo de datos
        </h1>
        <p className="text-sm text-marca-texto-suave mt-1">
          Descarga una copia completa de la tienda (productos, categorías, pedidos, clientes, cupones, banners, configuración e imágenes) o restáurala desde un archivo.
        </p>
      </div>

      {/* Exportar */}
      <div className="bg-white rounded-2xl border border-marca-beige-borde p-5">
        <h2 className="font-semibold text-marca-negro flex items-center gap-2 mb-1">
          <Download size={16} className="text-marca-marron" /> Descargar respaldo completo
        </h2>
        <p className="text-xs text-marca-texto-suave mb-4">
          Genera un archivo <span className="font-mono">.zip</span> con toda la base de datos y las imágenes. Guárdalo en un lugar seguro.
        </p>
        <button onClick={exportar} disabled={ocupado} className="btn-primario py-2.5 px-5 text-sm flex items-center gap-2 disabled:opacity-60">
          {exportando ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
          {exportando ? 'Creando respaldo...' : 'Descargar respaldo (.zip)'}
        </button>
      </div>

      {/* Restaurar */}
      <div className="bg-white rounded-2xl border border-marca-beige-borde p-5">
        <h2 className="font-semibold text-marca-negro flex items-center gap-2 mb-1">
          <Upload size={16} className="text-marca-marron" /> Restaurar desde un respaldo
        </h2>
        <p className="text-xs text-marca-texto-suave mb-3">
          Sube un archivo <span className="font-mono">.zip</span> creado con esta misma opción. Las imágenes se vuelven a subir y los datos se restauran.
        </p>
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl px-3 py-2.5 mb-4">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          <span>Los registros existentes con el mismo código serán <strong>sobrescritos</strong> por los del respaldo.</span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".zip,application/zip"
          className="hidden"
          onChange={e => restaurar(e.target.files?.[0])}
        />
        <button onClick={() => inputRef.current?.click()} disabled={ocupado} className="btn-outline py-2.5 px-5 text-sm flex items-center gap-2 disabled:opacity-60">
          {importando ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          {importando ? 'Restaurando...' : 'Seleccionar archivo .zip'}
        </button>
      </div>

      {/* Progreso / resumen */}
      {progreso && (
        <div className="flex items-center gap-2 text-sm text-marca-texto-suave bg-marca-beige/50 border border-marca-beige-borde rounded-xl px-4 py-3">
          <Loader2 size={15} className="animate-spin shrink-0" /> {progreso}
        </div>
      )}
      {resumen && (
        <div className="flex items-start gap-2 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <CheckCircle2 size={15} className="shrink-0 mt-0.5" /> {resumen.texto}
        </div>
      )}
    </div>
  )
}
