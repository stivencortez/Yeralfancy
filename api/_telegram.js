/**
 * Credenciales del bot de Telegram para las funciones /api/imagen.
 * Prioridad: variables de entorno (más seguras) → fila 1 de la tabla
 * config en Supabase (configuradas de forma visual en /admin/telegram).
 * Cache en memoria de 60 s para no consultar la base en cada imagen.
 */
let cache = { valor: null, ts: 0 }

export async function obtenerCredenciales() {
  const envToken = process.env.TELEGRAM_BOT_TOKEN
  const envChat = process.env.TELEGRAM_CHAT_ID
  if (envToken && envChat) return { token: envToken, chatId: envChat }

  if (cache.valor && Date.now() - cache.ts < 60_000) return cache.valor

  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return null

  try {
    const res = await fetch(
      `${url}/rest/v1/config?id=eq.1&select=telegram_token,telegram_chat`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    )
    if (!res.ok) return null
    const filas = await res.json()
    const fila = Array.isArray(filas) ? filas[0] : null
    if (!fila?.telegram_token || !fila?.telegram_chat) return null
    cache = { valor: { token: fila.telegram_token, chatId: fila.telegram_chat }, ts: Date.now() }
    return cache.valor
  } catch {
    return null
  }
}
