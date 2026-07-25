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
- `src/pages/admin/Respaldo.jsx` — backup completo (`/admin/respaldo`): exporta um .zip com todas as tabelas + imagens do Storage e restaura a partir dele (upsert; reescreve URLs de imagem).

## Convenções

- Cards de produto: **2:3 (`aspect-[2/3]`) com `object-cover`** — o card fica **100% preenchido** pela foto; o corte acontece **em cima/embaixo**, nunca deve sobrar faixa vazia. Preferência explícita do dono.
- O card respeita o **ponto central** salvo em `producto.capa` (via `posicionCapa`, só `objectPosition`) — o dono arrasta a foto no admin ("Ajustar portada") para escolher qual faixa aparece.
- A prévia do editor de portada é **2:3 sem zoom, idêntica ao card** (`estiloCapa`/zoom foram removidos; nunca reintroduzir zoom/escala nem `object-contain` com faixas nos cards).
- Enquadramentos antigos salvos com `zoom > 1` são ignorados (caem no centro) — ver `posicionCapa`.
- Toda miniatura de produto (inventário, carrinho, checkout, pedidos, tabela do admin) segue a mesma lógica: `fotoCapa` + `object-cover` + `posicionCapa` (o carrinho persiste `posicion` no item).
