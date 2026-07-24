# Yeral fancy — Guia para o Claude Code

Loja online (PWA, mobile-first, React + Vite + Tailwind + Supabase). App em espanhol; o dono se comunica em português.

## Fluxo de trabalho — deploy automático

Preferência do dono: **toda nova implementação deve ser versionada e publicada automaticamente**.

- Após concluir qualquer alteração: rodar o build para validar, commitar com mensagem clara e **fazer push para `main`**.
- O repositório está conectado ao **Vercel**, que faz o **deploy automático** a cada push no `main`.
- Variáveis de ambiente do Supabase (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) ficam configuradas no painel do Vercel (não estão no repo — `.env` é ignorado pelo git).

> Requisito para que o push automático funcione: o GitHub App do Claude Code precisa ter
> permissão **Contents: Read and write** no repositório. Sem isso, o push é bloqueado (403)
> e a alteração só entra via Pull Request mesclado manualmente pelo dono.

## Stack / estrutura

- `src/components/tienda/` — componentes da loja (ex.: `TarjetaProducto.jsx`, cards de produto).
- `src/pages/` — páginas da loja (`tienda/`) e do admin (`admin/`).
- `src/lib/supabase.js` — cliente Supabase e mapeadores DB↔app.
- `src/utils/imagen.js` — helpers de imagem (`imgSrc`, `fotoCapa`).
- Build: `npm run build` (Vite → `dist/`).

## Convenções

- Cards de produto usam imagem em **4:5 (`aspect-[4/5]`) com `object-contain`** (imagem inteira, sem zoom nem corte).
