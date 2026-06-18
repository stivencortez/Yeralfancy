import * as XLSX from 'xlsx'

const ALIAS_NOMBRE    = ['nombre', 'producto', 'nombre del producto', 'producto nombre']
const ALIAS_CATEGORIA = ['categoría', 'categoria', 'category', 'tipo']
const ALIAS_STOCK     = ['cant.', 'cant', 'cantidad', 'stock', 'inventario', 'existencia', 'existencias']
const ALIAS_COSTO     = ['costo unitario', 'costo', 'precio costo', 'cost']
const ALIAS_PRECIO    = ['precio unitario', 'precio', 'precio venta', 'venta', 'price']
const ALIAS_NOTAS     = ['notas', 'referencia', 'código', 'codigo', 'sku', 'observación', 'observacion']
const ALIAS_CREADO    = ['creado', 'fecha', 'fecha creación', 'fecha creacion', 'created']

function normalizarTexto(str) {
  return String(str ?? '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

function detectarColumna(encabezados, aliases) {
  for (const alias of aliases) {
    const norm = normalizarTexto(alias)
    const idx = encabezados.findIndex(h => normalizarTexto(h) === norm)
    if (idx !== -1) return idx
  }
  return -1
}

function encontrarFilaEncabezados(filas) {
  for (let i = 0; i < Math.min(filas.length, 25); i++) {
    const fila = filas[i]
    if (!fila || !Array.isArray(fila)) continue
    const textos = fila.map(c => normalizarTexto(String(c ?? '')))
    const tieneNombre = ALIAS_NOMBRE.some(a => textos.includes(normalizarTexto(a)))
    const tienePrecioOCosto =
      ALIAS_PRECIO.some(a => textos.includes(normalizarTexto(a))) ||
      ALIAS_COSTO.some(a => textos.includes(normalizarTexto(a)))
    if (tieneNombre && tienePrecioOCosto) return i
  }
  return -1
}

function parsearNumero(valor) {
  if (valor === null || valor === undefined || valor === '') return 0
  const limpio = String(valor).replace(/[^0-9.,-]/g, '').replace(',', '.')
  const n = Number(limpio)
  return isNaN(n) ? 0 : n
}

function parsearFecha(valor) {
  if (!valor) return null
  if (valor instanceof Date) return isNaN(valor.getTime()) ? null : valor.toISOString()
  if (typeof valor === 'number') {
    try {
      const parsed = XLSX.SSF.parse_date_code(valor)
      if (parsed) return new Date(parsed.y, parsed.m - 1, parsed.d).toISOString()
    } catch (_) { /* ignore */ }
  }
  const d = new Date(String(valor).trim())
  return isNaN(d.getTime()) ? null : d.toISOString()
}

/**
 * Lee un ArrayBuffer de un archivo .xlsx y devuelve productos parseados.
 * @param {ArrayBuffer} buffer
 * @returns {{ productos: object[], errors: object[], warnings: object[], summary: object }}
 */
export function parseInventoryExcel(buffer) {
  let workbook
  try {
    workbook = XLSX.read(buffer, { type: 'array', cellDates: true })
  } catch (e) {
    return errorResult('No se pudo leer el archivo. Asegúrate de que sea un Excel válido (.xlsx).')
  }

  const sheetName = workbook.SheetNames[0]
  if (!sheetName) return errorResult('El archivo no contiene hojas de cálculo.')

  const sheet = workbook.Sheets[sheetName]
  const filas = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, raw: false })

  if (!filas || filas.length === 0) return errorResult('El archivo está vacío.')

  const filaEncabezados = encontrarFilaEncabezados(filas)
  if (filaEncabezados === -1) {
    return errorResult(
      'No se encontraron columnas válidas. El archivo debe tener columnas como Nombre, Precio unitario y Cant.'
    )
  }

  const encabezados = (filas[filaEncabezados] || []).map(h => String(h ?? ''))

  const colNombre    = detectarColumna(encabezados, ALIAS_NOMBRE)
  const colCategoria = detectarColumna(encabezados, ALIAS_CATEGORIA)
  const colStock     = detectarColumna(encabezados, ALIAS_STOCK)
  const colCosto     = detectarColumna(encabezados, ALIAS_COSTO)
  const colPrecio    = detectarColumna(encabezados, ALIAS_PRECIO)
  const colNotas     = detectarColumna(encabezados, ALIAS_NOTAS)
  const colCreado    = detectarColumna(encabezados, ALIAS_CREADO)

  if (colNombre === -1) {
    return errorResult('No se encontró la columna de Nombre del producto.')
  }

  const productos   = []
  const errors      = []
  const warnings    = []
  const categoriasVistas  = new Set()
  const clavesVistas      = new Set()

  for (let i = filaEncabezados + 1; i < filas.length; i++) {
    const fila = filas[i]
    if (!fila || fila.every(c => c === null || c === undefined || String(c).trim() === '')) continue

    const numFila = i + 1
    const nombre  = String(fila[colNombre] ?? '').trim()

    if (!nombre) {
      const err = { fila: numFila, mensaje: `Fila ${numFila}: Nombre del producto vacío.` }
      errors.push(err)
      productos.push({ _fila: numFila, _estado: 'error', _mensajes: ['Nombre vacío'], nombre: '', categoria: '', stock: 0, precioCosto: 0, precioVenta: 0, gananciaUnidad: 0, notas: '', creadoEn: null })
      continue
    }

    const categoria = colCategoria !== -1 ? String(fila[colCategoria] ?? '').trim() : ''
    const notas     = colNotas     !== -1 ? String(fila[colNotas]     ?? '').trim() : ''
    const creadoEn  = colCreado    !== -1 ? parsearFecha(fila[colCreado]) : null

    // Stock
    let stock = 0
    const mensajesAdv = []
    if (colStock !== -1) {
      const raw = fila[colStock]
      if (raw !== null && raw !== undefined && String(raw).trim() !== '') {
        const n = parsearNumero(raw)
        if (isNaN(n)) mensajesAdv.push(`Stock inválido "${raw}", se usará 0.`)
        else stock = Math.max(0, Math.round(n))
      }
    }

    const precioCosto  = colCosto  !== -1 ? parsearNumero(fila[colCosto])  : 0
    const precioVenta  = colPrecio !== -1 ? parsearNumero(fila[colPrecio]) : 0
    const gananciaUnidad = precioVenta - precioCosto

    if (precioVenta === 0) mensajesAdv.push('Producto sin precio de venta.')

    if (categoria) categoriasVistas.add(categoria)

    // Duplicados dentro del Excel
    const clave = `${nombre.toLowerCase()}|${categoria.toLowerCase()}`
    if (clavesVistas.has(clave)) mensajesAdv.push('Nombre duplicado en el archivo.')
    else clavesVistas.add(clave)

    mensajesAdv.forEach(m => warnings.push({ fila: numFila, mensaje: `Fila ${numFila}: ${m}` }))

    productos.push({
      _fila:         numFila,
      _estado:       mensajesAdv.length > 0 ? 'advertencia' : 'valido',
      _mensajes:     mensajesAdv,
      nombre,
      categoria,
      notas,
      stock,
      precioCosto,
      precioVenta,
      gananciaUnidad,
      creadoEn,
    })
  }

  if (productos.length === 0) {
    return errorResult('No se encontraron productos en el archivo.')
  }

  return {
    productos,
    errors,
    warnings,
    summary: {
      total:            productos.length,
      validos:          productos.filter(p => p._estado !== 'error').length,
      conErrores:       productos.filter(p => p._estado === 'error').length,
      conAdvertencias:  productos.filter(p => p._estado === 'advertencia').length,
      categorias:       [...categoriasVistas],
    },
  }
}

function errorResult(mensaje) {
  return {
    productos: [],
    errors:    [{ fila: 0, mensaje }],
    warnings:  [],
    summary:   { total: 0, validos: 0, conErrores: 0, conAdvertencias: 0, categorias: [] },
  }
}
