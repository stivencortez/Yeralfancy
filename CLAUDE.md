# Yeral fancy — Guia para o Claude Code

Loja online (PWA, mobile-first, React + Vite + Tailwind + Supabase). App em espanhol; o dono se comunica em português.

## Fluxo de trabalho — deploy automático

Preferência do dono: **toda nova implementação deve ser versionada e publicada automaticamente**.

- Após concluir qualquer alteração: rodar o build para validar, commitar com mensagem clara e **fazer push para `main`**.
- O **Vercel está conectado ao fork `stivencortez/Yeralfancy`** (não ao repo principal). Depois que a mudança entra no `main` do repo principal, o dono clica em **"Sync fork"** no fork para disparar o deploy.
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
- `src/pages/admin/Respaldo.jsx` — backup completo (`/admin/respaldo`): exporta um .zip com todas as tabelas + imagens (Storage, Telegram e incrustadas) e restaura a partir dele (upsert; reescreve URLs de imagem).

## Imagens no Telegram (mídia fora do banco)

- Preferência do dono: **toda mídia vive no Telegram**; o banco guarda só texto (URLs `/api/imagen/<file_id>`).
- `api/imagen/index.js` (POST) — recebe a imagem e envia via bot a um canal privado (`sendDocument`); devolve `/api/imagen/<file_id>`.
- `api/imagen/[id].js` (GET) — proxy: resolve `getFile` e serve os bytes com cache imutável do CDN Vercel. O token do bot **nunca** chega ao navegador.
- Configuração **visual em `/admin/telegram`** (menu Sistema): token e ID do canal salvos nas colunas `telegram_token`/`telegram_chat` da tabela `config` (migração 007); a página tem guia, busca automática do ID e teste de conexão.
- As funções leem as credenciais nesta ordem: env vars `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID` do Vercel (se existirem, têm prioridade) → tabela `config` via REST (cache de 60 s em `api/_telegram.js`).
- Ordem de upload no cliente (`subirImagenConFallback`): 1º Telegram → 2º Supabase Storage → 3º data URL incrustada. Sem env vars configuradas, tudo segue funcionando via Storage.
- O service worker cacheia `/api/imagen/*` (CacheFirst, 30 dias) e o `navigateFallbackDenylist` impede o SPA fallback de engolir `/api/`.
- **Segurança**: o POST valida os bytes reais (só JPEG/PNG/WebP/GIF; SVG bloqueado por risco de XSS) e ignora o tipo declarado pelo cliente; o GET serve com `nosniff` + CSP.
- **`file_id` é atado ao bot**: regenerar o token do mesmo bot é seguro; trocar para OUTRO bot exige baixar um respaldo antes e restaurá-lo depois (senão as imagens antigas morrem).

## Convenções

- Cards de produto: **2:3 (`aspect-[2/3]`) com `object-cover`** — o card fica **100% preenchido** pela foto; o corte acontece **em cima/embaixo**, nunca deve sobrar faixa vazia. Preferência explícita do dono.
- O card respeita o **ponto central** salvo em `producto.capa` (via `posicionCapa`, só `objectPosition`) — o dono arrasta a foto no admin ("Ajustar portada") para escolher qual faixa aparece.
- A prévia do editor de portada é **2:3 sem zoom, idêntica ao card** (`estiloCapa`/zoom foram removidos; nunca reintroduzir zoom/escala nem `object-contain` com faixas nos cards).
- Enquadramentos antigos salvos com `zoom > 1` são ignorados (caem no centro) — ver `posicionCapa`.
- Toda miniatura de produto (inventário, carrinho, checkout, pedidos, tabela do admin) segue a mesma lógica: `fotoCapa` + `object-cover` + `posicionCapa` (o carrinho persiste `posicion` no item).
