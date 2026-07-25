import { useEffect, useState } from 'react'
import { Send, Save, Search, CheckCircle2, XCircle, Loader2, Copy, AlertTriangle, ImageIcon } from 'lucide-react'
import { supabase, subirImagenTelegram } from '../../lib/supabase'
import { useAdminToast } from '../../layouts/LayoutAdmin'

const SQL_MIGRACION = `ALTER TABLE public.config
ADD COLUMN IF NOT EXISTS telegram_token TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS telegram_chat  TEXT DEFAULT '';`

/* PNG de 1x1 para la prueba de conexión de punta a punta */
const PNG_PRUEBA = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

function blobPrueba() {
  const bin = atob(PNG_PRUEBA)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new Blob([bytes], { type: 'image/png' })
}

export default function Telegram() {
  const toast = useAdminToast()
  const [token, setToken] = useState('')
  const [chat, setChat] = useState('')
  const [faltaMigracion, setFaltaMigracion] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [buscando, setBuscando] = useState(false)
  const [canales, setCanales] = useState(null)
  const [probando, setProbando] = useState(false)
  const [prueba, setPrueba] = useState(null) // { ok, pasos: [{nombre, ok, detalle}], imagen }

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('config')
        .select('telegram_token, telegram_chat')
        .eq('id', 1)
        .maybeSingle()
      if (error) {
        if (`${error.message}`.includes('telegram_token')) setFaltaMigracion(true)
        return
      }
      setToken(data?.telegram_token || '')
      setChat(data?.telegram_chat || '')
    })()
  }, [])

  const guardar = async () => {
    setGuardando(true)
    try {
      const { error } = await supabase
        .from('config')
        .update({ telegram_token: token.trim(), telegram_chat: chat.trim() })
        .eq('id', 1)
      if (error) {
        if (`${error.message}`.includes('telegram_token')) { setFaltaMigracion(true); return }
        throw error
      }
      toast('Configuración de Telegram guardada', 'exito')
    } catch (e) {
      toast('Error al guardar: ' + e.message, 'error')
    } finally {
      setGuardando(false)
    }
  }

  /* Busca canales donde el bot es admin, usando getUpdates */
  const buscarCanales = async () => {
    if (!token.trim()) { toast('Pega primero el token del bot', 'error'); return }
    setBuscando(true)
    setCanales(null)
    try {
      const r = await fetch(`https://api.telegram.org/bot${token.trim()}/getUpdates`)
      const json = await r.json()
      if (!json.ok) throw new Error(json.description || 'token inválido')
      const mapa = new Map()
      for (const u of json.result || []) {
        const ch = u.channel_post?.chat || u.message?.chat || u.my_chat_member?.chat
        if (ch && (ch.type === 'channel' || ch.type === 'supergroup')) {
          mapa.set(ch.id, ch.title || String(ch.id))
        }
      }
      setCanales([...mapa.entries()].map(([id, titulo]) => ({ id: String(id), titulo })))
    } catch (e) {
      toast('No se pudo consultar el bot: ' + e.message, 'error')
    } finally {
      setBuscando(false)
    }
  }

  /* Prueba completa: bot → canal → subida real vía /api/imagen */
  const probar = async () => {
    setProbando(true)
    const pasos = []
    let imagen = null
    try {
      // 1. ¿El token es válido?
      try {
        const r = await fetch(`https://api.telegram.org/bot${token.trim()}/getMe`).then(x => x.json())
        if (!r.ok) throw new Error(r.description || 'token inválido')
        pasos.push({ nombre: 'Bot', ok: true, detalle: `@${r.result.username}` })
      } catch (e) {
        pasos.push({ nombre: 'Bot', ok: false, detalle: e.message })
        throw e
      }

      // 2. ¿El bot puede publicar en el canal?
      try {
        const r = await fetch(`https://api.telegram.org/bot${token.trim()}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chat.trim(), text: '✅ Yeral fancy conectado — este canal archiva las imágenes de la tienda.', disable_notification: true }),
        }).then(x => x.json())
        if (!r.ok) throw new Error(r.description || 'revisa el ID y que el bot sea admin del canal')
        pasos.push({ nombre: 'Canal', ok: true, detalle: 'el bot puede publicar' })
      } catch (e) {
        pasos.push({ nombre: 'Canal', ok: false, detalle: e.message })
        throw e
      }

      // 3. Subida real por la función del sitio (requiere config guardada y deploy)
      try {
        const url = await subirImagenTelegram(blobPrueba(), 'prueba_conexion.png')
        imagen = url
        pasos.push({ nombre: 'Sitio (/api/imagen)', ok: true, detalle: url })
      } catch (e) {
        pasos.push({ nombre: 'Sitio (/api/imagen)', ok: false, detalle: `${e.message} — guarda la configuración y espera el deploy; en modo local esto siempre falla` })
      }

      setPrueba({ ok: pasos.every(p => p.ok), pasos, imagen })
    } catch {
      setPrueba({ ok: false, pasos, imagen })
    } finally {
      setProbando(false)
    }
  }

  const copiarSQL = async () => {
    await navigator.clipboard.writeText(SQL_MIGRACION)
    toast('SQL copiado', 'exito')
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="text-xl font-bold text-marca-negro flex items-center gap-2">
          <Send size={20} className="text-marca-marron" /> Imágenes en Telegram
        </h1>
        <p className="text-sm text-marca-texto-suave mt-1">
          Las fotos que subas se archivan en un canal privado de Telegram y la base de datos guarda solo texto. Configúralo aquí, sin tocar Vercel.
        </p>
      </div>

      {faltaMigracion && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800 space-y-3">
          <p className="flex items-center gap-2 font-semibold"><AlertTriangle size={15} /> Falta un paso único en Supabase</p>
          <p className="text-xs">Abre tu proyecto en Supabase → <strong>SQL Editor</strong>, pega este código y pulsa <strong>Run</strong>. Después recarga esta página.</p>
          <pre className="bg-white border border-amber-200 rounded-xl p-3 text-[11px] overflow-x-auto">{SQL_MIGRACION}</pre>
          <button onClick={copiarSQL} className="btn-outline py-1.5 px-3 text-xs flex items-center gap-1.5"><Copy size={12} /> Copiar SQL</button>
        </div>
      )}

      {/* Guía */}
      <div className="bg-white rounded-2xl border border-marca-beige-borde p-5 text-sm text-marca-texto space-y-2">
        <h2 className="font-semibold text-marca-negro mb-1">Cómo obtener los datos (una sola vez)</h2>
        <ol className="list-decimal ml-5 space-y-1.5 text-xs text-marca-texto-suave">
          <li>En Telegram, habla con <strong>@BotFather</strong> → <span className="font-mono">/newbot</span> → copia el <strong>token</strong>.</li>
          <li>Crea un <strong>canal privado</strong> (ej.: "Yeral fancy — imágenes") y añade tu bot como <strong>administrador</strong>.</li>
          <li>Publica cualquier mensaje en el canal y usa <strong>"Buscar canales"</strong> aquí abajo para detectar el ID automáticamente.</li>
        </ol>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-2xl border border-marca-beige-borde p-5 space-y-4">
        <div>
          <label className="etiqueta">Token del bot</label>
          <input
            value={token}
            onChange={e => setToken(e.target.value)}
            className="input-campo font-mono text-xs"
            placeholder="123456789:AAH..."
            type="password"
            autoComplete="off"
          />
        </div>
        <div>
          <label className="etiqueta">ID del canal</label>
          <div className="flex gap-2">
            <input
              value={chat}
              onChange={e => setChat(e.target.value)}
              className="input-campo font-mono text-xs flex-1"
              placeholder="-100xxxxxxxxxx"
            />
            <button onClick={buscarCanales} disabled={buscando} className="btn-outline px-3 text-xs flex items-center gap-1.5 shrink-0 disabled:opacity-60">
              {buscando ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />} Buscar canales
            </button>
          </div>
          {canales && (
            <div className="mt-2 space-y-1">
              {canales.length === 0 && (
                <p className="text-xs text-marca-texto-suave">No se encontraron canales. Publica un mensaje en el canal (con el bot como admin) y vuelve a intentar.</p>
              )}
              {canales.map(c => (
                <button
                  key={c.id}
                  onClick={() => setChat(c.id)}
                  className={`w-full text-left text-xs px-3 py-2 rounded-xl border transition-colors ${chat === c.id ? 'border-marca-marron bg-marca-beige/50 font-semibold' : 'border-marca-beige-borde hover:bg-marca-beige/30'}`}
                >
                  {c.titulo} <span className="font-mono text-marca-texto-suave">({c.id})</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={guardar} disabled={guardando || faltaMigracion} className="btn-primario py-2.5 px-5 text-sm flex items-center gap-2 disabled:opacity-60">
            {guardando ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Guardar
          </button>
          <button onClick={probar} disabled={probando || !token.trim() || !chat.trim()} className="btn-outline py-2.5 px-5 text-sm flex items-center gap-2 disabled:opacity-60">
            {probando ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Probar conexión
          </button>
        </div>
        <p className="text-[11px] text-marca-texto-suave">
          El token queda guardado en tu base de Supabase y solo lo usan las funciones del sitio. Si algún día prefieres el modo más seguro, define <span className="font-mono">TELEGRAM_BOT_TOKEN</span> y <span className="font-mono">TELEGRAM_CHAT_ID</span> en Vercel: tienen prioridad.
        </p>
      </div>

      {/* Resultado de la prueba */}
      {prueba && (
        <div className={`rounded-2xl border p-5 space-y-2 ${prueba.ok ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
          <h2 className="font-semibold text-sm text-marca-negro">Resultado de la prueba</h2>
          {prueba.pasos.map(p => (
            <p key={p.nombre} className="text-xs flex items-start gap-2">
              {p.ok ? <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" /> : <XCircle size={14} className="text-red-500 shrink-0 mt-0.5" />}
              <span><strong>{p.nombre}:</strong> {p.detalle}</span>
            </p>
          ))}
          {prueba.imagen && (
            <p className="text-xs flex items-center gap-2 pt-1">
              <ImageIcon size={14} className="text-emerald-600" /> Imagen de prueba servida desde Telegram:
              <img src={prueba.imagen} alt="prueba" className="w-6 h-6 rounded border border-emerald-200 bg-white" />
            </p>
          )}
        </div>
      )}
    </div>
  )
}
