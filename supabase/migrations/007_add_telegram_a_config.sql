-- Credenciales del bot de Telegram para el archivo de imágenes.
-- Se configuran de forma visual en /admin/telegram (sin tocar Vercel).
ALTER TABLE public.config
ADD COLUMN IF NOT EXISTS telegram_token TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS telegram_chat  TEXT DEFAULT '';
