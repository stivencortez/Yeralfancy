import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ─── Categorias ───────────────────────────────────────────────────────────────

export const categoriaDeDB = (row) => ({
  id: row.id,
  nombre: row.nombre,
  descripcion: row.descripcion || '',
  imagen: row.imagen || '',
  activa: row.activa !== false,
  orden: row.orden || 0,
  creadoEn: row.created_at,
})

export const categoriaParaDB = (obj) => ({
  id: obj.id,
  nombre: obj.nombre,
  descripcion: obj.descripcion || '',
  imagen: obj.imagen || '',
  activa: obj.activa !== false,
  orden: obj.orden || 0,
})

// ─── Productos ────────────────────────────────────────────────────────────────

export const productoDeDB = (row) => ({
  id: row.id,
  nombre: row.nombre,
  descripcion: row.descripcion || '',
  categoriaId: row.categoria_id || null,
  precioCosto: Number(row.precio_costo) || 0,
  precioVenta: Number(row.precio_venta) || 0,
  stock: row.stock || 0,
  stockMinimo: row.stock_minimo || 5,
  fotos: row.fotos || [],
  capa: row.capa || null,
  destacado: row.destacado || false,
  activo: row.activo !== false,
  vendidos: row.vendidos || 0,
  creadoEn: row.created_at,
  actualizadoEn: row.updated_at || row.created_at,
})

export const productoParaDB = (obj) => ({
  id: obj.id,
  nombre: obj.nombre,
  descripcion: obj.descripcion || '',
  categoria_id: obj.categoriaId || null,
  precio_costo: obj.precioCosto || 0,
  precio_venta: obj.precioVenta || 0,
  stock: obj.stock || 0,
  stock_minimo: obj.stockMinimo || 5,
  fotos: obj.fotos || [],
  capa: obj.capa || null,
  destacado: obj.destacado || false,
  activo: obj.activo !== false,
  vendidos: obj.vendidos || 0,
})

// ─── Pedidos ──────────────────────────────────────────────────────────────────

export const pedidoDeDB = (row) => ({
  id: row.id,
  clienteNombre: row.cliente_nombre,
  clienteTelefono: row.cliente_telefono,
  productos: row.items || [],
  total: Number(row.total) || 0,
  costoTotal: Number(row.costo_total) || 0,
  gananciaTotal: Number(row.ganancia_total) || 0,
  estado: row.estado || 'Pendiente',
  descontadoStock: row.descontado_stock || false,
  creadoEn: row.created_at,
  actualizadoEn: row.updated_at || row.created_at,
})

export const pedidoParaDB = (obj) => ({
  id: obj.id,
  cliente_nombre: obj.clienteNombre,
  cliente_telefono: obj.clienteTelefono,
  items: obj.productos || [],
  total: obj.total || 0,
  costo_total: obj.costoTotal || 0,
  ganancia_total: obj.gananciaTotal || 0,
  estado: obj.estado || 'Pendiente',
  descontado_stock: obj.descontadoStock || false,
})

// ─── Clientes ─────────────────────────────────────────────────────────────────

export const clienteDeDB = (row) => ({
  id: row.id,
  nombre: row.nombre || '',
  telefono: row.telefono,
  totalPedidos: row.total_pedidos || 0,
  totalComprado: Number(row.total_comprado) || 0,
  ultimoPedido: row.ultimo_pedido || null,
  estadoUltimoPedido: row.estado_ultimo_pedido || null,
  creadoEn: row.created_at,
})

export const clienteParaDB = (obj) => ({
  id: obj.id,
  nombre: obj.nombre || '',
  telefono: obj.telefono,
  total_pedidos: obj.totalPedidos || 0,
  total_comprado: obj.totalComprado || 0,
  ultimo_pedido: obj.ultimoPedido || null,
  estado_ultimo_pedido: obj.estadoUltimoPedido || null,
})

// ─── Storage ──────────────────────────────────────────────────────────────────

const MAX_BYTES = 3 * 1024 * 1024 // 3 MB

const procesarImagenEnCanvas = (archivo, maxLado, calidad, modo, maxBytes) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onerror = () => reject(new Error('No se pudo leer la imagen'))
  reader.onload = () => {
    const img = new window.Image()
    img.onerror = () => reject(new Error('No se pudo procesar la imagen'))
    img.onload = () => {
      const escala = Math.min(1, maxLado / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(img.width * escala))
      canvas.height = Math.max(1, Math.round(img.height * escala))
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)

      if (modo === 'blob') {
        const comprimir = (q) => {
          canvas.toBlob((blob) => {
            if (!blob) { reject(new Error('Falló la compresión')); return }
            if (!maxBytes || blob.size <= maxBytes || q <= 0.38) resolve(blob)
            else comprimir(Math.max(0.38, +(q - 0.06).toFixed(2)))
          }, 'image/jpeg', q)
        }
        comprimir(calidad)
      } else {
        resolve(canvas.toDataURL('image/jpeg', calidad))
      }
    }
    img.src = reader.result
  }
  reader.readAsDataURL(archivo)
})

const subirImagenConFallback = async (archivo, bucket, prefijo, opciones = {}) => {
  const { maxLado = 1200, calidad = 0.82, maxBytes = MAX_BYTES } = opciones

  let blob
  try {
    blob = await procesarImagenEnCanvas(archivo, maxLado, calidad, 'blob', maxBytes)
  } catch {
    blob = archivo
  }

  const nombre = `${prefijo}_${Date.now()}.jpg`
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(nombre, blob, { upsert: false, contentType: 'image/jpeg' })

  if (!error) {
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(data.path)
    return pub.publicUrl
  }

  return procesarImagenEnCanvas(archivo, maxLado, calidad, 'dataurl')
}

export const subirImagenLogo = async (archivo) => {
  return subirImagenConFallback(archivo, 'logos', 'logo', { maxLado: 900, calidad: 0.90, maxBytes: MAX_BYTES })
}

export const subirImagenBanner = async (archivo) => {
  return subirImagenConFallback(archivo, 'banners', 'banner', { maxLado: 1600, calidad: 0.90, maxBytes: MAX_BYTES })
}

export const subirImagenCategoria = async (archivo) => {
  return subirImagenConFallback(archivo, 'categorias', 'categoria', { maxLado: 1400, calidad: 0.90, maxBytes: MAX_BYTES })
}

export const subirImagenProducto = async (archivo) => {
  return subirImagenConFallback(archivo, 'productos', 'produto', { maxLado: 1400, calidad: 0.90, maxBytes: MAX_BYTES })
}

// ─── Cupones ──────────────────────────────────────────────────────────────────

export const cuponDeDB = (row) => ({
  id: row.id,
  codigo: row.codigo || '',
  nombre: row.nombre || '',
  tipo: row.tipo || 'porcentaje',
  valor: Number(row.valor) || 0,
  alcance: row.alcance || 'todo',
  categoriaId: row.categoria_id || null,
  productoId: row.producto_id || null,
  fechaExpiracion: row.fecha_expiracion || null,
  activo: row.activo !== false,
  usosMaximos: row.usos_maximos ?? null,
  usosActuales: row.usos_actuales || 0,
  creadoEn: row.created_at,
})

export const cuponParaDB = (obj) => ({
  id: obj.id,
  codigo: (obj.codigo || '').toUpperCase().trim(),
  nombre: obj.nombre || '',
  tipo: obj.tipo || 'porcentaje',
  valor: Number(obj.valor) || 0,
  alcance: obj.alcance || 'todo',
  categoria_id: obj.categoriaId || null,
  producto_id: obj.productoId || null,
  fecha_expiracion: obj.fechaExpiracion || null,
  activo: obj.activo !== false,
  usos_maximos: obj.usosMaximos ? Number(obj.usosMaximos) : null,
  usos_actuales: obj.usosActuales || 0,
})

// ─── Banners ──────────────────────────────────────────────────────────────────

export const bannerDeDB = (row) => ({
  id: row.id,
  titulo: row.titulo || '',
  subtitulo: row.subtitulo || '',
  imagen: row.imagen || '',
  enlace: row.enlace || '',
  activo: row.activo !== false,
  orden: row.orden || 0,
  creadoEn: row.created_at,
})

export const bannerParaDB = (obj) => ({
  id: obj.id,
  titulo: obj.titulo || '',
  subtitulo: obj.subtitulo || '',
  imagen: obj.imagen || '',
  enlace: obj.enlace || '',
  activo: obj.activo !== false,
  orden: obj.orden || 0,
})

// ─── Config ───────────────────────────────────────────────────────────────────

export const configDeDB = (row) => ({
  nombre: row.nombre || 'Yeral fancy',
  logo: row.logo || null,
  logoDark: row.logo_dark || null,
  descripcion: row.descripcion || '',
  whatsapp: row.whatsapp || '04243677705',
  email: row.email || '',
  instagram: row.instagram || '',
  tiktok: row.tiktok || '',
  direccion: row.direccion || '',
  horario: row.horario || '',
  actualizadoEn: row.updated_at,
})

export const configParaDB = (obj) => ({
  id: 1,
  nombre: obj.nombre || 'Yeral fancy',
  logo: obj.logo || null,
  logo_dark: obj.logoDark || null,
  descripcion: obj.descripcion || '',
  whatsapp: obj.whatsapp || '04243677705',
  email: obj.email || '',
  instagram: obj.instagram || '',
  tiktok: obj.tiktok || '',
  direccion: obj.direccion || '',
  horario: obj.horario || '',
  updated_at: new Date().toISOString(),
})
