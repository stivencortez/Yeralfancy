import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, MessageCircle, ShoppingBag } from 'lucide-react'
import { useCarrito } from '../../store/useCarrito'
import { usePedidos } from '../../store/usePedidos'
import { useClientes } from '../../store/useClientes'
import { useConfig } from '../../store/useConfig'
import { formatearPrecio } from '../../utils/formatear'
import { construirMensajeWhatsApp, abrirWhatsApp } from '../../utils/whatsapp'
import { EstadoVacio } from '../../components/ui/Cargando'

export default function Checkout() {
  const navigate = useNavigate()
  const { items, getTotal, vaciarCarrito } = useCarrito()
  const crearPedido = usePedidos(s => s.crearPedido)
  const agregarCliente = useClientes(s => s.agregarOActualizarCliente)
  const whatsapp = useConfig(s => s.config.whatsapp)

  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [ciudad, setCiudad] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [errores, setErrores] = useState({})

  const total = getTotal()

  if (!items.length) {
    return (
      <EstadoVacio
        icono="🛍️"
        titulo="Carrito vacío"
        descripcion="No tienes productos en tu carrito."
        accion={<Link to="/" className="btn-primario mt-4">Explorar tienda</Link>}
      />
    )
  }

  const validar = () => {
    const e = {}
    if (!nombre.trim()) e.nombre = 'Ingresa tu nombre'
    if (!telefono.trim()) e.telefono = 'Ingresa tu número'
    else if (telefono.replace(/\D/g, '').length < 7) e.telefono = 'Número inválido'
    if (!ciudad.trim()) e.ciudad = 'Ingresa tu ciudad'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  const manejarFinalizar = async () => {
    if (!validar() || enviando) return
    setEnviando(true)

    const productos = items.map(i => ({
      productoId: i.productoId,
      nombre: i.nombre,
      precioCosto: i.precioCosto || 0,
      precioVenta: i.precioVenta,
      cantidad: i.cantidad,
      foto: i.foto,
    }))

    let pedido
    try {
      pedido = await crearPedido({
        clienteNombre: nombre.trim(),
        clienteTelefono: telefono.trim(),
        productos,
        subtotal: total,
        total,
      })
    } catch (err) {
      setErrores(e => ({ ...e, _general: 'Error al crear el pedido. Por favor intenta de nuevo.' }))
      setEnviando(false)
      return
    }

    agregarCliente(nombre.trim(), telefono.trim(), total, 'Pendiente')

    const mensaje = construirMensajeWhatsApp({
      clienteNombre: nombre.trim(),
      clienteTelefono: telefono.trim(),
      clienteCiudad: ciudad.trim(),
      items,
      total,
    })

    vaciarCarrito()
    setEnviando(false)

    abrirWhatsApp(whatsapp, mensaje)
    navigate(`/pedido-creado/${pedido.id}`)
  }

  return (
    <div className="contenedor py-4 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-marca-beige transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-xl text-marca-negro">Finalizar compra</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-tarjeta mb-4">
        <div className="p-4 border-b border-marca-beige-borde">
          <h2 className="font-semibold text-sm text-marca-negro">Resumen del pedido</h2>
        </div>
        <div className="p-4 space-y-3">
          {items.map(item => (
            <div key={item.productoId} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-marca-beige shrink-0">
                {item.foto && <img src={item.foto} alt={item.nombre} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-marca-negro truncate">{item.nombre}</p>
                <p className="text-xs text-marca-texto-suave">Cant: {item.cantidad}</p>
              </div>
              <span className="text-sm font-bold text-marca-marron-oscuro shrink-0">
                {formatearPrecio(item.precioVenta * item.cantidad)}
              </span>
            </div>
          ))}
          <div className="border-t border-marca-beige-borde pt-3 flex justify-between">
            <span className="font-bold text-marca-negro">Total</span>
            <span className="font-bold text-lg text-marca-marron-oscuro">{formatearPrecio(total)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-tarjeta p-4 mb-5">
        <h2 className="font-semibold text-sm text-marca-negro mb-4">Tus datos de contacto</h2>
        <div className="space-y-4">
          <div>
            <label className="etiqueta">Nombre completo *</label>
            <input
              type="text"
              value={nombre}
              onChange={e => { setNombre(e.target.value); setErrores(er => ({ ...er, nombre: '' })) }}
              placeholder="Tu nombre y apellido"
              className={`input-campo ${errores.nombre ? 'border-red-300 bg-red-50' : ''}`}
            />
            {errores.nombre && <p className="text-red-500 text-xs mt-1">{errores.nombre}</p>}
          </div>
          <div>
            <label className="etiqueta">Número de teléfono *</label>
            <input
              type="tel"
              value={telefono}
              onChange={e => { setTelefono(e.target.value); setErrores(er => ({ ...er, telefono: '' })) }}
              placeholder="Ej: 0424-3677705"
              className={`input-campo ${errores.telefono ? 'border-red-300 bg-red-50' : ''}`}
            />
            {errores.telefono && <p className="text-red-500 text-xs mt-1">{errores.telefono}</p>}
          </div>
          <div>
            <label className="etiqueta">Ciudad *</label>
            <input
              type="text"
              value={ciudad}
              onChange={e => { setCiudad(e.target.value); setErrores(er => ({ ...er, ciudad: '' })) }}
              placeholder="Ej: Caracas, Valencia, Maracaibo..."
              className={`input-campo ${errores.ciudad ? 'border-red-300 bg-red-50' : ''}`}
            />
            {errores.ciudad && <p className="text-red-500 text-xs mt-1">{errores.ciudad}</p>}
          </div>
        </div>
      </div>

      <div className="bg-green-50 rounded-2xl p-4 mb-5 border border-green-100">
        <div className="flex items-start gap-3">
          <MessageCircle size={20} className="text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-green-800 text-sm">Pago vía WhatsApp</p>
            <p className="text-green-600 text-xs mt-1">
              Al confirmar, te redirigiremos a WhatsApp con tu pedido listo para enviarnos. Coordinamos el pago y envío contigo directamente.
            </p>
          </div>
        </div>
      </div>

      {errores._general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl">
          <p className="text-red-600 text-sm text-center">{errores._general}</p>
        </div>
      )}

      <button
        onClick={manejarFinalizar}
        disabled={enviando}
        className={`w-full py-4 text-base font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
          enviando
            ? 'bg-marca-marron/60 text-white cursor-not-allowed'
            : 'bg-green-500 hover:bg-green-600 text-white active:scale-95'
        }`}
      >
        {enviando ? (
          <>
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Creando pedido...
          </>
        ) : (
          <>
            <MessageCircle size={20} />
            Confirmar y escribir por WhatsApp
          </>
        )}
      </button>
    </div>
  )
}
