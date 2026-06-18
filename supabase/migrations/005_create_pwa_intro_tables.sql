-- ============================================================
-- YERAL FANCY — Tabelas da Pantalla PWA / PWA Intro Screen
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.pwa_intro_config (
  id                 integer PRIMARY KEY DEFAULT 1,
  habilitado         boolean NOT NULL DEFAULT true,
  modo_visualizacion text    NOT NULL DEFAULT 'siempre',
  CONSTRAINT solo_una_fila CHECK (id = 1)
);

ALTER TABLE public.pwa_intro_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all_pwa_intro_config" ON public.pwa_intro_config;
CREATE POLICY "anon_all_pwa_intro_config" ON public.pwa_intro_config
  FOR ALL TO anon USING (true) WITH CHECK (true);

INSERT INTO public.pwa_intro_config (id, habilitado, modo_visualizacion)
VALUES (1, true, 'siempre')
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.pwa_intro_banners (
  id          text        PRIMARY KEY,
  imagen      text        NOT NULL DEFAULT '',
  boton_texto text        NOT NULL DEFAULT 'Desliza para entrar',
  cor_hint    text        NOT NULL DEFAULT '#ffffff',
  activo      boolean     NOT NULL DEFAULT true,
  orden       integer     NOT NULL DEFAULT 1,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Se a tabela já existir de uma versão anterior, adiciona as colunas que faltam
ALTER TABLE public.pwa_intro_banners ADD COLUMN IF NOT EXISTS cor_hint text NOT NULL DEFAULT '#ffffff';

ALTER TABLE public.pwa_intro_banners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all_pwa_intro_banners" ON public.pwa_intro_banners;
CREATE POLICY "anon_all_pwa_intro_banners" ON public.pwa_intro_banners
  FOR ALL TO anon USING (true) WITH CHECK (true);
