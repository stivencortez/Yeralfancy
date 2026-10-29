# PRD — Yeral fancy (loja online PWA + painel administrativo)

> **Objetivo deste documento:** descrever o sistema com detalhe suficiente para que uma pessoa (ou agente) que **só** tenha este arquivo consiga reconstruir um clone funcional e visualmente equivalente. Idioma deste PRD: português. Idioma da aplicação: **100 % espanhol** (textos da UI aparecem entre aspas exatamente como devem ser exibidos). Moeda: **USD**.
>
> Convenções: `código` = identificador/valor literal. "Replicar" = comportamento atual que deve ser reproduzido mesmo que pareça estranho (ver também §17 "Peculiaridades conhecidas").

---

## 1. Visão geral

**Produto:** loja online de uma única marca — *Yeral fancy* — que vende acessórios, bijuteria e moda feminina (foco em acessórios). Duas áreas:

1. **Loja pública** (mobile-first, parece um app nativo, instalável como PWA) — catálogo, favoritos, carrinho, checkout que **não cobra**: cria um pedido "Pendiente" e abre o WhatsApp da loja com a mensagem do pedido.
2. **Painel administrativo** (`/admin`, login com usuário/senha) — produtos, categorias, inventário, pedidos (com estados), clientes, banners, cupons, métricas/dashboard, configuração da loja, importação por Excel, backup .zip, arquivo de imagens no Telegram, tela de entrada da PWA.

**Dados da marca (valores padrão):**

| Campo | Valor |
|---|---|
| Nome | `Yeral fancy` |
| E-mail | `Yeralfancy2023@gmail.com` |
| WhatsApp | `04243677705` (formato venezuelano; prefixo país 58) |
| Instagram | `https://www.instagram.com/yeral.fancy?igsh=MXVjYjNkeHJ4cXdhNg%3D%3D&utm_source=qr` |
| TikTok | `https://www.tiktok.com/@yeralfancy?_r=1&_t=ZN-97IEeNgVkhi` |
| Descrição | "Somos Yeral fancy, tu tienda de accesorios y moda femenina. Encontrarás collares, pulseras, aretes, anillos y mucho más. Todo diseñado para hacerte brillar." |
| Horário | "Lunes a Sábado: 9:00 AM – 7:00 PM" |
| Admin padrão | usuário `admin` / senha `yeralfancy2024` |

**Personas:** (a) cliente final (celular, compra via WhatsApp); (b) dona da loja (admin, sem conhecimento técnico).

**Fora de escopo:** pagamento online, frete calculado (é "A coordinar por WhatsApp"), contas de cliente, multi-loja, multi-idioma, autenticação real do admin (ver §17).

---

## 2. Stack e infraestrutura

| Camada | Tecnologia |
|---|---|
| Front-end | React 18.3 + Vite 5 + React Router DOM 6 (SPA) |
| Estilo | Tailwind CSS 3.4 (+ PostCSS/autoprefixer), `darkMode: 'class'` (só no admin) |
| Estado | Zustand 4 (`persist` em localStorage para a maioria das stores) |
| Animação | framer-motion 11 |
| Ícones | lucide-react 0.379 |
| Gráficos | recharts 2.12 |
| Excel | xlsx 0.18 |
| ZIP | jszip 3.10 |
| PWA | vite-plugin-pwa 0.20 + workbox-window |
| Backend de dados | **Supabase** (Postgres + Storage) acessado **direto do navegador** com a chave `anon` via `@supabase/supabase-js` 2.x; RLS aberto para `anon` |
| Funções serverless | Vercel Functions (Node) em `/api/imagen` — proxy de imagens do Telegram |
| Hospedagem | Vercel (build `npm run build`, saída `dist`) |

**Scripts npm:** `dev` (vite), `build` (vite build), `preview`.

**Variáveis de ambiente**
- Cliente (Vite): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- Servidor (Vercel): as mesmas duas (lidas pelas funções via `process.env`) + opcionais `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (têm prioridade sobre o que está salvo no banco).
- `.env.example` contém só as duas `VITE_*`.

**Alias:** `@` → `/src` (vite `resolve.alias`).

**Chunking (rollup manualChunks):** `vendor-react` (react, react-dom, react-router-dom), `vendor-charts` (recharts), `vendor-motion` (framer-motion), `vendor-zustand` (zustand).

**`vercel.json`:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "routes": [
    { "handle": "filesystem" },
    { "src": "/api/imagen/(.*)", "dest": "/api/imagen/[id].js?id=$1" },
    { "src": "/api/imagen", "dest": "/api/imagen/index.js" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```
`public/_redirects`: `/*    /index.html   200`.

**Deploy (preferência do dono):** toda mudança é validada com `npm run build`, commitada e enviada para `main`; o Vercel está ligado a um *fork* e o dono clica "Sync fork" para publicar.

---

## 3. Estrutura do projeto

```
api/
  _telegram.js            # obtenerCredenciales() (env → tabla config, cache 60 s)
  imagen/index.js         # POST: sube imagen a Telegram
  imagen/[id].js          # GET: proxy de la imagen por file_id
public/
  _redirects
  icons/{favicon.svg,pwa-192x192.svg,pwa-512x512.svg}
  logos/{IMG_5720,IMG_5722,IMG_5723,IMG_6107}.PNG   # logos prediseñados de la marca
src/
  main.jsx, App.jsx, index.css
  lib/supabase.js                  # cliente + mapeadores DB↔app + subida de imágenes
  data/datosIniciales.js           # CONFIG_INICIAL, CREDENCIALES_ADMIN (+ arrays vacíos)
  utils/{formatear,imagen,whatsapp,parseInventoryExcel}.js
  hooks/{useToast.js,usePWAStandalone.js}
  store/{useApp,useAuth,useBanners,useCarrito,useCategorias,useClientes,useConfig,useCupones,useFavoritos,usePWAIntro,usePedidos,useProductos}.js
  layouts/{LayoutTienda,LayoutAdmin}.jsx
  components/ui/{Cargando,InicializadorSupabase,Modal,ScrollToTop,Toast}.jsx
  components/tienda/{BarraInferior,BotonWhatsApp,CarruselBanners,Header,TarjetaProducto}.jsx
  components/admin/Sidebar.jsx
  components/pwa/{PWAIntroGate,PWAIntroScreen,SlideToEnterButton}.jsx
  pages/tienda/{Inicio,Categorias,CategoriaDetalle,Producto,Carrito,Favoritos,Checkout,PedidoCreado,Buscar,Sobre}.jsx
  pages/admin/{Login,Dashboard,Productos,CategoriasAdmin,Inventario,Pedidos,Banners,Clientes,Metricas,Configuracion,PWAIntro,ImportarExcel,Cupones,Respaldo,Telegram,MigrarImagenes}.jsx
supabase/migrations/001…008_*.sql
```

---

## 4. Sistema de design

### 4.1 Tokens Tailwind (`tailwind.config.js`)

```js
colors.marca = {
  negro:'#1C1C1C', blanco:'#FFFFFF', marron:'#9B7B5B', 'marron-oscuro':'#7A5C3A',
  'marron-claro':'#B89070', beige:'#F5EFE0', 'beige-borde':'#E8D8C0', 'beige-suave':'#FAF8F5',
  fondo:'#FAFAF8', texto:'#1C1C1C', 'texto-suave':'#7A6B5E', dorado:'#C9A96E'
}
fontFamily.sans = Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif
fontFamily.display = Georgia, 'Times New Roman', serif
boxShadow = {
  tarjeta:'0 2px 12px rgba(155,123,91,.10)', 'tarjeta-hover':'0 8px 28px rgba(155,123,91,.20)',
  barra:'0 -2px 20px rgba(28,28,28,.08)', modal:'0 20px 60px rgba(28,28,28,.20)',
  flotante:'0 8px 32px rgba(28,28,28,.13),0 2px 8px rgba(28,28,28,.06)', banner:'0 4px 24px rgba(28,28,28,.12)'
}
borderRadius = { xl:'1rem', '2xl':'1.25rem', '3xl':'1.5rem', '4xl':'2rem' }
animation/keyframes = slide-up (translateY 20px→0 + fade, .3s ease-out), fade-in (.2s),
  bounce-in (scale .8→1, .4s cubic-bezier(.34,1.56,.64,1)), shimmer (bg-position -200%→200%, 1.5s infinite),
  pwa-chevron (translateX 0↔4px, opacity .5↔1, 1.2s infinite), pwa-thumb-hint (translateX 0↔9px, 2.2s, delay 1.5s, infinite)
```
Fonte Inter (Google Fonts 300–700) carregada no `index.html` com `preconnect`.

### 4.2 CSS global (`src/index.css`)
- `@tailwind base/components/utilities`.
- **base:** `box-sizing:border-box`, `-webkit-tap-highlight-color:transparent`; `html` font Inter + `scroll-behavior:smooth`; `body` `bg-marca-fondo text-marca-texto`, `overscroll-behavior-y:none`, antialiased; scrollbar 4 px (track beige, thumb marrón arredondado); `input,textarea,select{outline:none}`.
- **components:** `.safe-area-bottom/.safe-area-top` (env safe-area), `.contenedor` (`max-w-7xl mx-auto px-4`), `.tarjeta` (`bg-white rounded-2xl shadow-tarjeta`), `.btn-primario` (fundo negro, texto branco, semibold, px-6 py-3, rounded-xl, `active:scale-95`, hover marron-oscuro), `.btn-secundario` (beige/marron-oscuro), `.btn-outline` (transparente, borda beige-borde, hover marrón), `.input-campo` (w-full, bg beige, borda beige-borde, rounded-xl, px-4 py-3, foco: borda marrón + fundo branco), `.etiqueta` (block text-sm medium mb-1.5), `.scroll-horizontal`, `.linea-divisora`, `.badge-estado` (pill xs medium), `.shimmer-bg` (gradiente `#f5efe0/#e8d8c0` animado).
- **utilities:** `.text-balance`. **PWA:** keyframes `pwaChevron`, `pwaThumbHint`, classe `.pwa-chevron`.
- **Modo escuro do admin** (`.dark` no wrapper do LayoutAdmin; variáveis CSS em `:root`): `--dk-bg #181512`, `--dk-surface #211C18` (sidebar/header), `--dk-card #29231E`, `--dk-raised #312920`, `--dk-hover #3A2F28`, `--dk-border rgba(255,255,255,.07)`, `--dk-text #F6EFE7`, `--dk-muted #B9AA9A`, `--dk-muted2 #D6C0A2`, `--dk-accent #C8A46D`, `--dk-warm #B89067`. Sobrescreve com `!important` dentro de `.dark`: `aside`/`header` → surface; `.bg-white` → card; `.bg-marca-beige` → raised (hover: `--dk-hover`); `.bg-marca-beige-suave/.bg-marca-fondo` → bg; textos `text-marca-negro/texto` → `--dk-text`, `texto-suave` → muted, `marron` → warm, `marron-oscuro/dorado` → accent; bordas `border-marca-beige-borde` → `--dk-border`; alertas amber/red com tons translúcidos; `.input-campo` com fundo raised; `.btn-outline`, `.etiqueta`, `.tarjeta`, `select option`, scrollbar, sombras. Wrapper raiz usa `bg-[#181512]` explícito quando escuro.

### 4.3 Estilo visual
Fundo branco/`#FAFAF8`, detalhes beige e marrón, texto preto, minimalista, feminino, cantos suaves (`rounded-2xl`), sombras sutis, poucos ícones, animações suaves (toque `active:scale-95`, fade/slide-up). Mobile-first; breakpoint desktop é `lg` (1024 px).

### 4.4 Componentes de UI compartilhados
- **Toast** (`useToast` hook → `{toasts, agregar(mensaje, tipo='exito', duracion=3000), quitar}`; tipos `exito|error|aviso`; `ToastContenedor`: fixo `top-4` centralizado, `z-[9999]`, largura `calc(100%-2rem)` máx `sm`, cartão branco com ícone (CheckCircle verde / XCircle vermelho / AlertCircle âmbar), texto, botão X; animação `slide-up`).
- **Modal** (`abierto, onCerrar, titulo, tamano: sm|md|lg|xl|full`): overlay `bg-black/40 backdrop-blur-sm`, em mobile é *bottom sheet* (`rounded-t-3xl`, `items-end`), em `sm+` centralizado `rounded-3xl`; `max-h-[92vh]` scroll; cabeçalho sticky com título e botão X; bloqueia o scroll do `body` enquanto aberto; clique fora fecha. Larguras: sm `max-w-sm`, md `max-w-lg`, lg `max-w-2xl`, xl `max-w-4xl`.
- **Cargando** (spinner + texto), **EsqueletoTarjeta**, **EstadoVacio({icono, titulo, descripcion, accion})** (centro, emoji/ícone, título semibold, descrição pequena, ação opcional).
- **ScrollToTop:** a cada mudança de `pathname` → `window.scrollTo({top:0,left:0,behavior:'instant'})`.

---

## 5. Modelo de dados (Supabase / Postgres)

Todas as tabelas têm **RLS habilitado** com política `FOR ALL TO anon USING (true) WITH CHECK (true)` (nome `anon_all_<tabla>`). IDs são `TEXT` gerados no cliente com `generarId()` = `` `${Date.now()}-${Math.random().toString(36).slice(2,9)}` `` (exceto `config`/`credenciales_admin`/`pwa_intro_config`, que são `INTEGER id=1`).

```sql
-- categorias
id TEXT PK, nombre TEXT NOT NULL, descripcion TEXT DEFAULT '', imagen TEXT DEFAULT '',
activa BOOLEAN DEFAULT true, orden INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW()

-- productos
id TEXT PK, nombre TEXT NOT NULL, descripcion TEXT DEFAULT '',
categoria_id TEXT REFERENCES categorias(id) ON DELETE SET NULL,
precio_costo NUMERIC(10,2) DEFAULT 0, precio_venta NUMERIC(10,2) DEFAULT 0,
stock INTEGER DEFAULT 0, stock_minimo INTEGER DEFAULT 5, fotos TEXT[] DEFAULT '{}',
destacado BOOLEAN DEFAULT false, activo BOOLEAN DEFAULT true, vendidos INTEGER DEFAULT 0,
created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
capa JSONB DEFAULT NULL        -- migración 006: {indice, zoom, x, y, fit}

-- pedidos
id TEXT PK, cliente_nombre TEXT NOT NULL, cliente_telefono TEXT NOT NULL, items JSONB DEFAULT '[]',
total NUMERIC(10,2) DEFAULT 0, costo_total NUMERIC(10,2) DEFAULT 0, ganancia_total NUMERIC(10,2) DEFAULT 0,
estado TEXT DEFAULT 'Pendiente', descontado_stock BOOLEAN DEFAULT false,
created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()

-- clientes
id TEXT PK, nombre TEXT DEFAULT '', telefono TEXT UNIQUE, total_pedidos INTEGER DEFAULT 0,
total_comprado NUMERIC(10,2) DEFAULT 0, ultimo_pedido TIMESTAMPTZ, estado_ultimo_pedido TEXT,
created_at TIMESTAMPTZ DEFAULT NOW()

-- banners
id TEXT PK, titulo TEXT DEFAULT '', subtitulo TEXT DEFAULT '', imagen TEXT DEFAULT '', enlace TEXT DEFAULT '',
activo BOOLEAN DEFAULT true, orden INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW()

-- config (una fila, id=1)
id INTEGER PK DEFAULT 1, nombre TEXT DEFAULT 'Yeral fancy', logo TEXT DEFAULT '', logo_dark TEXT DEFAULT '' (002),
descripcion TEXT DEFAULT '', whatsapp TEXT DEFAULT '04243677705', email TEXT DEFAULT 'Yeralfancy2023@gmail.com',
instagram TEXT DEFAULT '', tiktok TEXT DEFAULT '', direccion TEXT DEFAULT '',
horario TEXT DEFAULT 'Lunes a Sábado: 9:00 AM – 7:00 PM', updated_at TIMESTAMPTZ DEFAULT NOW(),
telegram_token TEXT DEFAULT '', telegram_chat TEXT DEFAULT ''   -- migración 007

-- credenciales_admin (una fila)
id INTEGER PK DEFAULT 1, usuario TEXT NOT NULL DEFAULT 'admin', contrasena TEXT NOT NULL DEFAULT 'yeralfancy2024'

-- cupones (008)
id TEXT PK, codigo TEXT UNIQUE NOT NULL, nombre TEXT DEFAULT '', tipo TEXT DEFAULT 'porcentaje',   -- 'porcentaje'|'fijo'
valor NUMERIC(10,2) DEFAULT 0, alcance TEXT DEFAULT 'total',                                      -- app usa 'todo'|'categoria'|'producto'
categoria_id TEXT, producto_id TEXT, fecha_expiracion DATE, activo BOOLEAN DEFAULT true,
usos_maximos INTEGER DEFAULT 100, usos_actuales INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW()

-- importaciones_productos (004; historial del import Excel)
id TEXT PK, archivo_nombre TEXT NOT NULL, total_filas INT DEFAULT 0, productos_creados INT DEFAULT 0,
productos_actualizados INT DEFAULT 0, productos_ignorados INT DEFAULT 0, categorias_creadas INT DEFAULT 0,
estado TEXT DEFAULT 'completado' ('completado'|'con_errores'), errores TEXT (JSON array), creado_en TIMESTAMPTZ DEFAULT now(),
usuario_id TEXT   + índice (creado_en desc)   + RLS con políticas select/insert abiertas

-- pwa_intro_config (005; CHECK id = 1)
id INTEGER PK DEFAULT 1, habilitado BOOLEAN NOT NULL DEFAULT true, modo_visualizacion TEXT NOT NULL DEFAULT 'siempre'

-- pwa_intro_banners (005)
id TEXT PK, imagen TEXT NOT NULL DEFAULT '', boton_texto TEXT NOT NULL DEFAULT 'Desliza para entrar',
cor_hint TEXT NOT NULL DEFAULT '#ffffff', activo BOOLEAN NOT NULL DEFAULT true, orden INTEGER NOT NULL DEFAULT 1,
created_at TIMESTAMPTZ NOT NULL DEFAULT now()
```
**Storage (003):** bucket público `categorias` com política `FOR ALL TO anon` restrita a `bucket_id='categorias'`. Os buckets `logos`, `banners`, `productos` também são usados como fallback de upload (devem existir/ser públicos).
**Seed (001):** linha `config(id=1)` e `credenciales_admin(id=1)`; o seed de categorias/produtos/banners fictícios existe no SQL mas é **apagado pelo app** na primeira carga (ver §7.2).

### 5.1 Mapeadores DB ↔ app (`src/lib/supabase.js`)
Modelo da aplicação em camelCase; os mapeadores aplicam estes defaults:
- **categoria:** `{id,nombre,descripcion||'',imagen||'',activa(!==false),orden||0,creadoEn}` ↔ `{id,nombre,descripcion,imagen,activa,orden}`.
- **producto:** `{id,nombre,descripcion,categoriaId(categoria_id||null),precioCosto,precioVenta (Number),stock||0,stockMinimo(||5),fotos||[],capa||null,destacado,activo(!==false),vendidos||0,creadoEn,actualizadoEn(updated_at||created_at)}`; escrita inclui `capa` e não envia timestamps.
- **pedido:** `{id,clienteNombre,clienteTelefono,productos(items||[]),total,costoTotal,gananciaTotal,estado(||'Pendiente'),descontadoStock,creadoEn,actualizadoEn}`; coluna `items` ↔ campo `productos`.
- **cliente:** `{id,nombre,telefono,totalPedidos,totalComprado,ultimoPedido,estadoUltimoPedido,creadoEn}`.
- **cupón:** `cuponDeDB`: `alcance||'todo'`, `usosMaximos ?? null`, `fechaExpiracion||null`; `cuponParaDB`: `codigo` em MAIÚSCULAS e `trim`, `valor` Number, `usos_maximos` = Number ou `null` se vazio.
- **banner:** `{id,titulo,subtitulo,imagen,enlace,activo,orden,creadoEn}`.
- **config:** `{nombre||'Yeral fancy', logo||null, logoDark||null, descripcion, whatsapp||'04243677705', email, instagram, tiktok, direccion, horario, actualizadoEn}`; `configParaDB` envia `id:1` e `updated_at: now`. (telegram_* **não** passam pelo mapeador; têm a sua própria página.)

---

## 6. Camada de imagens

### 6.1 Pipeline de upload no cliente (`subirImagenConFallback(archivo, bucket, prefijo, {maxLado, calidad, maxBytes})`)
1. Redimensiona/comprime em `<canvas>` → JPEG: escala `min(1, maxLado/max(w,h))`; começa em `calidad` e, se o blob passar de `maxBytes` (3 MB), reduz a qualidade em 0,06 por passo até o mínimo 0,38. Se o canvas falhar usa o arquivo original.
2. Nome do arquivo: `` `${prefijo}_${Date.now()}.jpg` ``.
3. **Ordem de destino:** (1) **Telegram** via `POST /api/imagen` → devolve `/api/imagen/<file_id>`; (2) **Supabase Storage** `bucket` (`upsert:false`, `image/jpeg`) → URL pública; (3) **data URL** JPEG incrustada no banco.
4. Presets: `subirImagenLogo` (bucket `logos`, prefixo `logo`, 900 px, q 0.90), `subirImagenBanner` (`banners`, `banner`, 1600 px, q 0.90), `subirImagenCategoria` (`categorias`, `categoria`, 1400 px), `subirImagenProducto` (`productos`, prefijo `produto`, 1400 px, q 0.90).
5. `subirImagenTelegram(blob, nombre)`: `fetch('/api/imagen', {method:'POST', headers:{'Content-Type':'application/octet-stream','X-Tipo':blob.type||'image/jpeg','X-Nombre':nombre}, body:blob})`; erro se `!res.ok` ("Telegram HTTP <status>") ou se faltar `json.url`.

### 6.2 Funções serverless
- **`api/_telegram.js` → `obtenerCredenciales()`**: usa `TELEGRAM_BOT_TOKEN`+`TELEGRAM_CHAT_ID` se ambos existirem; senão consulta `${VITE_SUPABASE_URL}/rest/v1/config?id=eq.1&select=telegram_token,telegram_chat` com `apikey`/`Authorization: Bearer <anon>`; cache em memória 60 s; devolve `{token, chatId}` ou `null`.
- **`POST /api/imagen`** (CORS `*`; `OPTIONS` → 204): `501 {error:'Telegram no configurado'}` sem credenciais; lê o corpo (Buffer); vazio → 400 "Cuerpo vacío"; > 4 MB → 413 "Imagen demasiado grande"; detecta o tipo pelos **magic bytes** (JPEG `FF D8 FF`, PNG `89 50 4E 47`, WEBP `RIFF…WEBP`, GIF87a/89a) — **ignora o tipo declarado**; outro → 415 "Solo se aceptan imágenes JPEG, PNG, WebP o GIF" (SVG bloqueado por XSS). Nome: `X-Nombre` sem extensão, só `[\w-]`, máx 60, + extensão detectada. Envia com `sendDocument` (FormData: `chat_id`, `disable_notification=true`, `document`=Blob) para preservar os bytes. Resposta `{url: '/api/imagen/<file_id>'}` (usa `result.document.file_id`, com fallback à maior `photo`). Erros do Telegram → 502 "Telegram: <descripción>".
- **`GET /api/imagen/<id>`** (também `HEAD`; CORS `*`): valida `id` com `/^[\w-]{10,200}$/` (400 "Identificador inválido"); `getFile` → `file_path` (404 "Imagen no encontrada"); baixa de `https://api.telegram.org/file/bot<token>/<file_path>` (502 se falhar); responde 200 com `Content-Type` por extensão (jpg/jpeg/png/webp/gif; senão `application/octet-stream` + `Content-Disposition: attachment`), `Cache-Control: public, max-age=31536000, s-maxage=31536000, immutable`, `X-Content-Type-Options: nosniff`, `Content-Security-Policy: default-src 'none'`. O token nunca chega ao navegador.
- **Regra:** o `file_id` do Telegram está atado ao bot. Regenerar o token do mesmo bot é seguro; mudar para outro bot exige backup antes e restauração depois.

### 6.3 Helpers (`src/utils/imagen.js`)
- `imgSrc(url, _w, _q)` → devolve a URL sem transformação (transformações do Supabase estão desligadas de propósito: o plano gratuito falha com 403 ao exceder).
- `fotoCapa(producto)` → `fotos[capa.indice]` se `indice` é inteiro e existe; senão `fotos[0]`; senão `''`.
- `posicionCapa(capa)` → `undefined` se não há capa, se `zoom !== 1`, ou se x=y=50; senão `"${x}% ${y}%"` (x,y limitados a 0–100; não numérico → 50). Usado em miniaturas (carrinho, checkout, pedidos).
- `estiloCapa(capa, defaultFit='contain')` → `{className, style}`: `w-full h-full object-<fit>` (fit = `capa.fit` se `cover|contain`, senão o default); `style.objectPosition` = `"x% y%"` se ≠ 50/50; `style.transform = scale(zoom)` se `zoom > 1`.

---

## 7. Estado global (Zustand) e inicialização

### 7.1 Stores (todas com `persist` salvo indicação) — nome da chave localStorage
| Store | Chave LS | Estado | Ações principais |
|---|---|---|---|
| `useApp` | — | `isReady` | `setReady()` |
| `useAuth` | `yf-auth` | `autenticado`, `credenciales` | `sincronizarDesdeSupabase`, `iniciarSesion(u,p)`, `cerrarSesion`, `cambiarContrasena(nueva)` |
| `useProductos` | `yf-productos` | `productos[]` | `sincronizar…`, `agregarProducto`, `editarProducto`, `eliminarProducto`, `limpiarProductos`, `toggleActivo`, `toggleDestacado`, `actualizarStock`, `descontarStock`, getters |
| `useCategorias` | `yf-categorias` | `categorias[]` | CRUD, `limpiarCategorias`, `toggleActiva`, `reordenar`, `getActivas`, `getCategoria` |
| `useBanners` | `yf-banners` | `banners[]` | CRUD, `limpiarBanners`, `toggleActivo`, `getActivos` |
| `useConfig` | `yf-config` | `config` | `sincronizar…`, `actualizarConfig` |
| `useClientes` | `yf-clientes` | `clientes[]` | `sincronizar…`, `agregarOActualizarCliente`, `limpiarClientes` |
| `usePedidos` | **no persiste** | `pedidos[]` | `sincronizar…`, `crearPedido`, `cambiarEstado`, `limpiarPedidos`, getters |
| `useCupones` | **no persiste** | `cupones[]` | `sincronizar…`, CRUD, `validarCodigo`, `registrarUso` |
| `useCarrito` | `yf-carrito` | `items[]` | ver §8.6 |
| `useFavoritos` | `yf-favoritos` | `favoritos[]` (ids) | `toggleFavorito`, `esFavorito` |
| `usePWAIntro` | `yf-pwa-intro` | `config`, `banners[]` | ver §9.12 |

Padrões comuns:
- **`sincronizarDesdeSupabase`**: `select('*')` com ordenação (`productos`: `created_at` asc; `categorias`/`banners`/`pwa_intro_banners`: `orden`; `clientes`/`pedidos`/`cupones`: `created_at` desc); em erro apenas `console.warn` e mantém o cache local.
- **CRUD "otimista no servidor"**: `agregar/editar/eliminar` fazem a chamada ao Supabase primeiro, lançam `Error(error.message)` se falhar e só então atualizam o estado local. `agregar*` gera `id=generarId()` (produto aceita `datos.id` manual se `trim()` não vazio) e `creadoEn/actualizadoEn`.
- **Toggles** (`toggleActivo`, `toggleDestacado`, `toggleActiva`): atualização **otimista** local e `update` no Supabase; se falhar, reverte o valor local. `toggleActivo`/`toggleDestacado` de produto também gravam `updated_at`.
- **`limpiar*`**: `delete().neq('id','__never__')` (apaga tudo) e zera o estado local.
- **`editarProducto`**: `update({...productoParaDB(actualizado), updated_at})`.
- **`actualizarStock(id, cantidad)`**: `stock = max(0, cantidad)`.
- **`descontarStock(id, cantidad)`**: `stock = max(0, stock − cantidad)` e `vendidos += cantidad`.
- **Getters de produtos:** `getProducto(id)`, `getProductosActivos()` (activo), `getDestacados()` (activo && destacado), `getPorCategoria(catId)` (activo && categoriaId), `getMasVendidos()` (ativos ordenados por `vendidos` desc), `getBajoStock()` (activo && 0 < stock ≤ stockMinimo), `getAgotados()` (activo && stock === 0).
- **`useCategorias.reordenar(id, orden)`**: otimista + update sem reverter.
- **`useConfig.actualizarConfig(datos)`**: `upsert` em `config`; se falhar por falta da coluna `logo_dark` (mensagem contém `logo_dark` ou código `PGRST204`) refaz o upsert sem `logo_dark` e devolve `{guardadoParcial:true}` (mantém o `logoDark` local anterior); senão `{guardadoParcial:false}`. `CONFIG_INICIAL.logo = '/logos/IMG_5723.PNG'`.
- **`useAuth`**: `iniciarSesion` consulta `credenciales_admin(id=1)` (fonte da verdade), atualiza as credenciais locais e compara; se o Supabase estiver indisponível, usa as credenciais locais (padrão `admin`/`yeralfancy2024`). `cambiarContrasena` atualiza local e faz `update contrasena` (só `console.error` em falha). Senha em **texto puro** (ver §17).

### 7.2 `InicializadorSupabase` (montado em `App`, renderiza `null`)
Em `useEffect` (uma vez):
1. Se `localStorage['yf-cleanup-ficticios-v1']` não existe: `Promise.allSettled` de (a) `delete` de `productos` com ids `prod1…prod8`, (b) `delete` de `banners` `ban1,ban2`, (c) `update categorias set imagen='' where imagen like '%picsum.photos%'`; remove do LS `yf-productos` e `yf-banners`; grava a flag.
2. `localStorage.removeItem('yf-pedidos')` (sempre).
3. `Promise.allSettled` de sincronizar **categorias, productos, banners, config, auth, pwa-intro, cupones**; depois `useApp.setReady()`.
4. Sem bloquear: sincronizar **pedidos** e **clientes**.

### 7.3 Helpers de formato (`utils/formatear.js`)
`formatearPrecio(n)` → `` `$${Number(n).toFixed(2)}` ``; `formatearFecha(iso)` → `es-VE` `dd/mm/aaaa` (ou `—`); `formatearFechaHora` → igual + `hh:mm`; `formatearHora`; `calcularGanancia(costo, venta)=venta−costo`; `calcularMargen(costo, venta)` = `0` se `costo===0`, senão `(venta−costo)/venta*100`; `generarId`; `truncarTexto`; `estadoColor(estado)` → classes Tailwind:
`Pendiente` yellow-100/800 · `Esperando pago` orange-100/800 · `Pago` green-100/800 · `En preparación` blue-100/800 · `En envío` indigo-100/800 · `Entregado` emerald-100/800 · `No finalizado` gray-100/600 · `Cancelado` red-100/800.
`ESTADOS_PEDIDO = ['Pendiente','Esperando pago','Pago','En preparación','En envío','Entregado','No finalizado','Cancelado']`.

---

## 8. Loja pública

### 8.1 Rotas e layout
Rotas dentro de `LayoutTienda`: `/` Inicio · `/categorias` · `/categorias/:id` · `/producto/:id` · `/carrito` · `/favoritos` · `/checkout` · `/pedido-creado/:id` · `/buscar` · `/sobre`. Inicio, Categorias, CategoriaDetalle, Producto e Carrito carregam de imediato; Favoritos, Checkout, PedidoCreado, Buscar, Sobre e **todo o admin** são `lazy` (`Suspense` com spinner `w-8 h-8 border-2` centrado em `min-h-[50vh]`).

**`LayoutTienda`:** `min-h-screen bg-marca-fondo flex flex-col`; `<Header/>`, `<main className="flex-1 pb-32 lg:pb-0"><Outlet/></main>`, `<BarraInferior/>`, `<ToastContenedor/>`, `<PWAIntroGate/>`. Expõe `useTiendaToast()` (contexto com `agregar`).

### 8.2 Header
- **Mobile (<lg):** `px-5 py-3.5`; logo (`config.logo || '/logos/IMG_5723.PNG'`, `h-9`) à esquerda → `/`; ícone lupa → `/buscar`; ícone sacola → `/carrito` com *badge* (negro, branco) = total de itens (`9+` se >9, anim `bounce-in`).
- **Desktop (lg+):** container; logo `h-10`; formulário de busca (`type=search`, placeholder "Buscar accesorios, collares, aretes...", ao enviar → `/buscar?q=<termo>` e limpa); `nav` com links **Inicio** (`/`, end), **Categorías**, **Favoritos**, **Nosotros** (`/sobre`) — ativo: `bg-marca-beige text-marca-marron-oscuro`; botão **Carrito** (negro) com contador marrón.
- Sticky `top-0 z-40`, `bg-white/95 backdrop-blur-sm`, borda inferior, `safe-area-top`.

### 8.3 Barra inferior (mobile, `lg:hidden`)
Flutuante: `fixed left-3 right-3 z-40`, `bottom: max(1rem, calc(env(safe-area-inset-bottom)+.5rem))`, cartão branco `rounded-[26px]` com sombra forte. Cinco `NavLink`: **Inicio** `/` (Home, `end`), **Buscar** `/buscar` (Search), **Carrito** `/carrito` (ShoppingBag, badge = nº de itens), **Favoritos** `/favoritos` (Heart, badge = nº favoritos), **Más** `/sobre` (User). Item ativo: indicador `motion.div layoutId="barra-indicador"` (fundo negro, `rounded-xl`, tween 0.28 s) atrás do ícone branco `strokeWidth 2.2`; inativo cor `#B0A090`, `strokeWidth 1.6`; rótulo `text-[10px]`. Badges `bg-marca-marron`, `9+`.

### 8.4 `BotonWhatsApp` (flutuante, definido mas não montado em nenhuma tela)
Botão circular verde 52 px fixo `right-4`, abre `abrirWhatsApp(whatsapp, '¡Hola! Me gustaría obtener más información sobre sus productos.')`. (Replicar o componente; o uso é opcional.)

### 8.5 Início (`/`)
Estados: `cargando = !isReady && !productos.length` → skeletons.
1. **Banner**: container `pt-4 mb-6` (desktop `pt-6 mb-8`) com `<CarruselBanners/>`.
2. Se carregando: chips-skeleton (mobile) + 2 seções skeleton (4 cartões mobile / 5 desktop).
3. Senão:
   - **Chips de categorias (mobile)**: scroll horizontal; primeiro chip negro "Ver todo" → `/categorias`; depois um chip por categoria ativa (borda beige) → `/categorias/:id`.
   - **Grid de categorias (desktop, `xl:grid-cols-8`, `grid-cols-4`)**: título "Categorías"; quadrado com imagem (`object-cover`) ou emoji 💎, fundo pastel rotativo (`rose/amber/emerald/sky/violet/pink/teal/orange-50`), nome abaixo; hover `scale-105`.
   - **"Productos populares"** (link "Ver todo →" `/categorias`): `destacados` ou, se vazio, `nuevos`. Limite 4 (mobile, 2 colunas) / 5 (desktop, `grid-cols-3 sm:4 xl:5`).
   - **"Más vendidos"**: `getMasVendidos()`, limite 4/5.
   - **"Nuevos accesorios"**: ativos por `creadoEn` desc, limite 4/5 (renderizado quando há produtos).
   - Sem produtos: "✨ ¡Próximamente!" / "Los productos estarán disponibles muy pronto."
   - Cada seção só renderiza se tiver produtos. `onAgregarAlCarrito` dos cartões mostra toast "Producto agregado al carrito" (o `TarjetaProducto` atual não chama a prop; manter a assinatura).

### 8.6 `CarruselBanners`
Usa `getActivos()` (ativos por `orden`). Sem banners → `null`. Proporção **`aspect-ratio: 21/9`** no componente (o admin recomenda 16:5 — ver §17), `rounded-2xl shadow-banner bg-marca-beige`. Auto-avança a cada **4 s** (se >1), swipe horizontal (limiar 40 px), pontos (mobile no topo-direita; desktop embaixo-centro; ativo = pílula branca `w-5`), setas `ChevronLeft/Right` só desktop. Imagem `object-cover` `loading=eager fetchPriority=high` e *preload* da seguinte. Gradiente inferior escuro; texto (subtítulo em caixa-alta tracking, título em negrito branco, píldora "Ver colección" se há `enlace`). Clique → `navigate(banner.enlace)` se houver enlace.

### 8.7 `TarjetaProducto`
`Link` → `/producto/:id`, `active:scale-[0.98]`. Imagem em **`aspect-[3/4] rounded-2xl`** fundo `#F8F6F2`, skeleton `animate-pulse` até `onLoad`, imagem com `estiloCapa(capa,'contain')` (+ `fotoCapa`) e fade-in; sem foto → ícone `ShoppingBag`. Botão coração (30 px, topo-direita, `stopPropagation`) alterna favorito (vermelho preenchido quando favorito). `stock===0` → overlay branco 60 % com pílula "Agotado". `stock ≤ stockMinimo` (e >0) → pílula âmbar "Pocas unidades" (embaixo-esquerda). Informação: nome (bold, 1 linha), nome da categoria (ou espaço invisível), preço `formatearPrecio(precioVenta)`.

### 8.8 Categorias (`/categorias`)
Título "Categorías"; grid `2 / sm:3` colunas de cartões: imagem `aspect-video` (`object-cover`, hover `scale-105`) ou emoji 💎; nome e "<n> productos" (contagem de produtos ativos da categoria). Skeletons enquanto `!isReady && !categorias.length`. Vazio: "📂 Sin categorías aún".

### 8.9 Detalhe da categoria (`/categorias/:id`)
Cabeçalho com seta voltar (`navigate(-1)`), nome e "<n> productos"; grid `2/sm:3/lg:4` de `TarjetaProducto` (`getPorCategoria`). Enquanto `!isReady && !categoria`: skeleton. Categoria inexistente: "Categoría no encontrada" + botão "Volver" (→ `/categorias`). Sem produtos: 📦 "Sin productos en esta categoría" / "Próximamente agregaremos productos aquí.".

### 8.10 Produto (`/producto/:id`)
Estado: `fotoActual` e `cantidad` (reiniciam ao trocar `id`). Produto inexistente → "Producto no encontrado" + "Volver". Derivados: `sinStock = stock===0`, `bajoStock = !sinStock && stock ≤ stockMinimo`, `relacionados` = até 4 produtos ativos da mesma categoria, exceto o atual.
- **Mobile (<lg):** imagem full-width `h-[65vh]` `object-cover` com degradê branco na base; overlay "Agotado" se sem stock; botões de vidro (voltar e compartilhar via `navigator.share` se disponível); miniaturas (50 px) empilhadas à direita se >1 foto; card de informações `-mt-6 rounded-t-[28px] px-5 pt-5 pb-32` com: badges (Disponible verde / Pocas unidades âmbar / Agotado vermelho + chip da categoria → `/categorias/:id`), coração, nome (`text-[1.35rem]` bold), preço (`text-xl` `marron-oscuro`), descrição + código `#<id>` (selecionável, minúsculo), seletor de quantidade (1…`stock`) se há stock, botões **"Comprar ahora"** (negro, `rounded-full`) e **"Agregar al carrito"** (`#F0EAE0`), ou aviso vermelho "Producto agotado por el momento." / "Escríbenos por WhatsApp para más información."; seção "Productos similares" (grid 2 col).
- **Desktop (lg+):** breadcrumb (Volver / categoria / nome), grid `[55fr_45fr] gap-14`: galeria (imagem `h-[560px] object-contain p-6`, setas, coração, miniaturas 70 px) e painel sticky (`top-24`) com categoria em caixa-alta, nome `2rem`, preço + badge de stock, descrição + `#id`, quantidade + "<n> en stock", botões (`btn-primario` com ícone `Zap` "Comprar ahora" / `btn-outline` "Agregar al carrito"); abaixo, "También te puede gustar" (grid 2/4).
- **Ações:** `manejarAgregar` → `agregarAlCarrito(producto, cantidad)` + toast "Producto agregado al carrito"; `manejarComprarAhora` → agrega e vai a `/carrito`. Ambas não fazem nada se `sinStock`.

### 8.11 Carrinho (`/carrito`)
`sincronizarConCatalogo(productos)` roda a cada mudança de catálogo. Vazio: 🛍️ "Tu carrito está vacío" / "Agrega productos a tu carrito para continuar comprando." + botão "Explorar tienda". Com itens (`max-w-2xl`): cabeçalho voltar + "Carrito (n)"; cartões com miniatura 80 px (`object-cover` + `objectPosition`), nome (link ao produto), preço, controle −/+ (`+` limita ao `stock` do item; `−` até 0 remove), subtotal da linha, botão lixeira. Resumo: "Subtotal (n artículos)", "Envío — A coordinar por WhatsApp", **Total** (`text-xl marron-oscuro`). Botões **"Finalizar compra"** (→ `/checkout`) e **"Seguir comprando"** (→ `/`).

**`useCarrito` (persist `yf-carrito`):**
- `agregarAlCarrito(producto, cantidad=1)`: se já existe, soma e limita a `producto.stock`; senão adiciona `{productoId, nombre, precioVenta, precioCosto, categoriaId, cantidad, foto: fotoCapa(producto)||null, posicion: posicionCapa(producto.capa)||null, stock}` (⚠ quantidade inicial não é limitada ao stock).
- `quitarDelCarrito(id)`; `cambiarCantidad(id, c)` (c ≤ 0 remove); `vaciarCarrito()`.
- `sincronizarConCatalogo(productos)` (ignora se lista vazia): remove itens cujo produto existe mas está inativo ou com `stock ≤ 0`; atualiza `nombre, precioVenta, precioCosto, categoriaId, stock, foto, posicion` e limita `cantidad` ao novo stock; itens cujo produto não está no catálogo ficam intactos.
- `getTotalItems()` = Σ cantidad; `getTotal()` = Σ precioVenta×cantidad; `getCostoTotal()` = Σ precioCosto×cantidad.

### 8.12 Checkout (`/checkout`)
Itens vazios → 🛍️ "Carrito vacío" / "No tienes productos en tu carrito." + "Explorar tienda". Seções (`max-w-2xl`): **Resumen del pedido** (miniatura 48 px, nome, "Cant: n", subtotal; se há desconto mostra Subtotal e "Cupón <CÓDIGO>: -$x"; Total); **Cupón de descuento**; **Tus datos de contacto**; aviso verde **"Pago vía WhatsApp"** ("Al confirmar, te redirigiremos a WhatsApp con tu pedido listo para enviarnos. Coordinamos el pago y envío contigo directamente."); botão verde **"Confirmar y escribir por WhatsApp"** (durante envio: spinner + "Creando pedido...", desabilitado).

**Validação** (mensagens): nome vazio → "Ingresa tu nombre"; telefone vazio → "Ingresa tu número", ou com <7 dígitos → "Número inválido"; cidade vazia → "Ingresa tu ciudad". Campos: "Nombre completo *" (placeholder "Tu nombre y apellido"), "Número de teléfono *" (`type=tel`, "Ej: 0424-3677705"), "Ciudad *" ("Ej: Caracas, Valencia, Maracaibo..."). Erros somem ao editar o campo; erro geral em caixa vermelha.

**Cupom:** input em maiúsculas (placeholder "CÓDIGO", Enter aplica) + botão "Aplicar". `validarCodigo(codigo)` busca no estado: mesmo código (maiúsculas, trim), `activo`, não expirado (`fechaExpiracion >= hoje 00:00`) e `usosMaximos === null || usosActuales < usosMaximos`. Inválido → "Código inválido, vencido o sin usos disponibles". Se `calcularDescuento` = 0 → "Este cupón no aplica a los productos en tu carrito". Aplicado: caixa esmeralda com código, "<valor>% de descuento" ou "$X de descuento" e botão X para remover.

**`calcularDescuento(cupon, items)`:** base = Σ precioVenta×cantidad dos itens conforme o `alcance` (`todo`: todos; `categoria`: `item.categoriaId === cupon.categoriaId`; `producto`: `item.productoId === cupon.productoId`); base 0 → 0; `porcentaje` → `round(base×valor/100, 2 casas)`; `fijo` → `min(valor, base)`. `total = max(0, subtotal − descuento)`.

**Fluxo "Confirmar" (`manejarFinalizar`)** — ordem obrigatória:
1. `validar()`; se `enviando` retorna; `enviando=true`.
2. **Abre síncrona uma janela em branco** `window.open('', '_blank')` dentro do gesto do usuário (Safari/iOS bloqueia popups após `await`).
3. Monta `productos` = itens `{productoId,nombre,precioCosto,precioVenta,cantidad,foto}`.
4. `await crearPedido({clienteNombre, clienteTelefono, productos, subtotal, total})`; em erro fecha a janela, mostra `_general: "Error: <msg>"` e sai.
5. Se havia cupom → `registrarUso(cupon.id)` (incrementa `usos_actuales`, sem esperar).
6. `agregarOActualizarCliente(nombre, telefono, total, 'Pendiente')` (sem esperar).
7. Monta a mensagem (§8.14), `vaciarCarrito()`, `abrirWhatsApp(whatsapp, mensaje, ventana)` e `navigate('/pedido-creado/<id>')`.

**`usePedidos.crearPedido(datos)`:** `costoTotal = Σ precioCosto×cantidad`; `gananciaTotal = datos.total − costoTotal`; estado `'Pendiente'`; `descontadoStock=false`; insere (`pedidoParaDB`) e adiciona no início da lista.
(⚠ `subtotal` e o desconto **não são gravados** no pedido; só o `total` já descontado.)

### 8.13 Pedido criado (`/pedido-creado/:id`)
Pedido não encontrado (o store de pedidos não persiste) → "Pedido no encontrado" + "Volver a la tienda". Senão: ícone ✔ verde, "¡Pedido creado!", "Tu pedido fue registrado. Revisa WhatsApp para confirmar y coordinar el pago."; cartão com "Pedido #<últimos 6 do id em MAIÚSCULAS>", data/hora, linhas "<nome> ×<cant>" + valor, Total; botões **"Abrir WhatsApp nuevamente"** (reenvia mensagem sem cidade/desconto) e **"Seguir comprando"**.

### 8.14 WhatsApp (`utils/whatsapp.js`)
`construirMensajeWhatsApp({clienteNombre, clienteTelefono, clienteCiudad, items, total, descuento, codigoCupon})`:
```
Hola, soy *<nombre>*. Quiero finalizar esta compra en *Yeral fancy* 🛍️

*Productos:*
• [#<productoId>] <nombre> x<cantidad> — $<precio×cantidad>
...
[\nSubtotal: $X]            ← só se descuento > 0
[\n🏷️ Cupón *<CÓDIGO>*: -$D] ← só se descuento > 0

*Total: $<total>*[\n\n📍 Ciudad: *<ciudad>*]

Quedo en espera de su confirmación. ¡Gracias!
```
`abrirWhatsApp(numero, mensaje, ventana=null)`: remove não-dígitos; se não começa com `58` → `58` + número sem `0` inicial; URL `https://wa.me/<num>?text=<encodeURIComponent(mensaje)>`; se `ventana` aberta, faz `ventana.location.href = url`, senão `window.open(url,'_blank')`.

### 8.15 Favoritos, Buscar, Sobre
- **Favoritos** (`useFavoritos`, persist `yf-favoritos`): vazio → 🤍 "Sin favoritos aún" / "Guarda tus productos favoritos tocando el corazón." + "Explorar tienda"; senão título "Favoritos (n)" com coração e grid 2/3/4 col. de cartões (ignora ids que já não existem).
- **Buscar** (`/buscar?q=`): campo visível em mobile (`autoFocus`, botão limpar X e botão enviar; Enter navega a `?q=`); filtra produtos **ativos** por `nombre` ou `descripcion` (case-insensitive, `includes`); sem termo mostra todos ("<n> productos"); com termo "<n> resultado(s) para "<termo>""; vazio → 😔 "Sin resultados" / `No encontramos productos para "<termo>".` + "Ver categorías".
- **Sobre** (`/sobre`, "Nosotros"/"Más"): logo (ou monograma "YF"), nome (display), descrição; cartões: **WhatsApp** (verde, abre com mensagem "¡Hola! Quisiera obtener información sobre sus productos."), **Instagram** (se houver; texto `@yeral.fancy`), **TikTok** (se houver; ícone SVG próprio; `@yeralfancy`), **Email** (`mailto:`), **Horario** (se houver), **Dirección** (se houver); rodapé "© 2024 <nombre>. Todos los derechos reservados.".

---

## 9. Painel administrativo

### 9.1 Acesso e layout
- Rota pública `/admin/login`; `/admin` e filhas exigem `autenticado` (senão `Navigate` para `/admin/login`). A sessão (`autenticado`) fica persistida em `yf-auth`.
- **Login:** fundo beige centralizado, logo (ou monograma YF) , "Yeral fancy" / "Panel Administrativo", cartão "Iniciar sesión" com "Usuario" (placeholder `admin`), "Contraseña" (olho mostrar/ocultar), botão "Entrar" (espera artificial de 500 ms; spinner). Erro: "Usuario o contraseña incorrectos". Já autenticado → redireciona a `/admin`.
- **`LayoutAdmin`:** flex; `Sidebar` + coluna com `header` sticky de 60 px (botão hambúrguer `lg:hidden`, logo/nome em mobile, nome da loja em desktop, botão tema Sun/Moon só mobile) e `<main className="flex-1 p-4 lg:p-6 overflow-auto"><Outlet/></main>`; `ToastContenedor`. Contextos: `useAdminToast()` e `useAdminModoOscuro()` → `{modoOscuro, toggleModoOscuro}`. Preferências em LS: `admin-modo-oscuro` e `admin-sidebar-expandida` (string `'true'|'false'`, padrão sidebar expandida **true**). O logo exibido é `config.logoDark` quando em modo escuro e existir, senão `config.logo`.
- **Sidebar** (largura 240 px expandida / 68 px colapsada, spring; sticky `h-screen` em desktop; em mobile é *drawer* de 260 px com overlay `bg-black/50`): cabeçalho de 60 px com logo (ou monograma + "Panel Admin"), botão colapsar/expandir (desktop) ou fechar (drawer). Grupos e itens (rótulo — rota — ícone lucide):
  - **Principal:** Dashboard `/admin` (`end`, LayoutDashboard) · Pedidos `/admin/pedidos` (ShoppingCart)
  - **Catálogo:** Productos `/admin/productos` (Package) · Categorías `/admin/categorias` (Tag) · Inventario `/admin/inventario` (Warehouse) · Banners `/admin/banners` (Image) · Cupones `/admin/cupones` (Ticket) · Importar Excel `/admin/importar-excel` (FileSpreadsheet) · Pantalla PWA `/admin/pwa-intro` (Smartphone)
  - **Análisis:** Clientes `/admin/clientes` (Users) · Métricas `/admin/metricas` (BarChart2)
  - **Sistema:** Configuración `/admin/configuracion` (Settings) · Respaldo `/admin/respaldo` (Database) · Telegram `/admin/telegram` (Send) · Migrar imágenes `/admin/migrar-imagenes` (RefreshCw)
  - **Accesos:** "Ver tienda" (abre `/` em nova aba, Globe)
  - **Rodapé:** alternador "Modo claro/oscuro" (com interruptor pílula) e "Cerrar sesión" (vermelho; chama `cerrarSesion` + `navigate('/admin/login')`).
  Item ativo: `bg-marca-beige text-marca-marron-oscuro` + barra esquerda de 3 px `marron`; colapsada mostra só ícones com `title`; rótulos animam largura/opacidade.

### 9.2 Dashboard (`/admin`)
Animação em cascata (`staggerChildren .055`, `fadeUp`). Cabeçalho "Bienvenida de nuevo" + data longa (`es-VE`, weekday/day/month) e seletor segmentado **Hoy / Esta semana / Este mes** (padrão **Este mes**; indicador `layoutId="filtroActivo"`). Intervalos: *Hoy* = 00:00 de hoje → agora; *Esta semana* = domingo 00:00 da semana → agora; *Este mes* = dia 1 00:00 → agora. (⚠ não há "rango personalizado" — ver §17.)
- **Tarjetas héroe:** "Facturación total" (nota "Ventas confirmadas", barra dourada à esquerda) e "Ganancia neta" (nota "Solo pedidos pagados") — usando `getFacturacionPeriodo(inicio, fin)`.
- **Mini-cartões (6):** Pedidos pendientes (estado `Pendiente`), Pedidos pagados (`Pago`), No finalizados (`No finalizado`), Ticket promedio (média de `total` dos `Pago`, 0 se nenhum), Clientes (nº), Productos activos.
- **Alertas de inventario** (se há agotados ou bajo stock): cartão âmbar com contagem "<n> producto(s) requiere(n) atención", link "Ver inventario →", até **3** linhas (primeiro agotados "Agotado", depois bajo stock "Solo n unidad(es)" / "Bajo stock").
- **Gráfico de área** "Ventas — últimos 7 días" / "Solo pedidos en estado Pago": 7 pontos (dia de semana abreviado `es-VE`, total `Pago` do dia 00:00–23:59:59), gradiente marrón, eixos sem linha, tooltip customizado (cores por tema); sem vendas → estado vazio "Aún no hay ventas confirmadas en este periodo".
- **"Más vendidos"** (top 5 por `vendidos`, link "Ver todo" → métricas): posição numerada (1º dourado, 2º beige), barra de progresso animada proporcional ao líder; vazio → "Aún no hay productos vendidos".
- **"Pedidos recientes"** (6 primeiros): avatar com inicial, nome, data/hora, total e badge de estado; link "Ver todos" → pedidos; vazio → "Sin pedidos aún. Cuando lleguen aparecerán aquí.".

**`getFacturacionPeriodo(inicio, fin)`:** soma `total` e `gananciaTotal` apenas de pedidos `estado==='Pago'` com `creadoEn` no intervalo. **Regra de negócio central:** somente pedidos **Pago** contam como venda/lucro.

### 9.3 Pedidos (`/admin/pedidos`)
Filtros: busca por nome do cliente (`includes`, case-insens.) e select de estado ("Todos los estados" + os 8). Lista em cartão com divisórias: `#<6 últimos do id>`, badge de estado, nome, "telefone · data/hora", "<n> producto(s)", total, botão WhatsApp (mensagem `Hola <nombre>, te contactamos de Yeral fancy sobre tu pedido #<id6>.`) e `<select>` de estado inline. Clicar na área do pedido abre **Modal "Detalle del pedido"**: id/estado, cliente (nome, telefone, data), lista de produtos (miniatura, nome, "Cant: n · $x c/u", subtotal), caixa Total / Costo / Ganancia (verde), select "Cambiar estado", botões "WhatsApp" e "Cerrar". Vazio: "Sin pedidos encontrados".
**Mudar estado (`manejarCambiarEstado`)**: `debeRegistrarCliente = estadoAnterior !== 'Pago' && nuevo === 'Pago'`; chama `cambiarEstado(id, nuevo, descontarStock)`; se `debeRegistrarCliente` → `agregarOActualizarCliente(nombre, telefono, total, 'Pago')`; toast `Estado actualizado: <estado>` (ou `Error al cambiar estado: <msg>`); atualiza o estado do modal aberto.
**`usePedidos.cambiarEstado(id, nuevo, fnDescontarStock)`:** se `nuevo==='Pago'` **e** o anterior não era `Pago` **e** `!descontadoStock` → executa `descontarStock(productoId, cantidad)` para cada item (em paralelo); `descontadoStock = (nuevo==='Pago') ? true : valor anterior` (nunca volta a `false`, evitando descontar duas vezes); `update` com `estado`, `descontado_stock`, `updated_at`. Não repõe estoque ao cancelar.

### 9.4 Produtos (`/admin/productos`)
Cabeçalho "Productos" + botão "Nuevo"; busca (ignora `#` inicial; casa `nombre` ou `id`). Tabela (colunas responsivas): Producto (miniatura 40 px com `estiloCapa` + nome + categoria), Costo (≥sm), Precio, Stock (≥md; pílula "Agotado" / "Bajo (n)" / n), Estado (≥lg: ponto verde/cinza + estrela se destacado), Acciones (estrela destacar, olho ativar/desativar, editar, lixeira com `confirm('¿Eliminar "<nombre>"?')` → toast "Producto eliminado" tipo `aviso`). Linhas inativas com `opacity-50`. Vazio: "Sin productos" / "Agrega tu primer producto.".
**Modal xl "Nuevo producto" / "Editar producto"** em duas colunas (lg): 
- Esquerda: **Código del producto** (novo: input mono, só `[A-Za-z0-9-_]`, MAIÚSCULAS, máx 30, vazio = autogerar, placeholder "Ej: PUL-001"; edição: texto fixo), Nombre*, Descripción (3 linhas), Categoría (só ativas, "Seleccionar categoría"), Precio de costo / Precio de venta (USD, `step 0.01`), chips "Ganancia: $x" e "Margen: y%" (quando ambos preenchidos), Stock actual, Stock mínimo (padrão 5), checkboxes Activo / Destacado.
- Direita: **Fotos** (máx **5**, até **12 MB** cada, só imagens; dropzone com clique/arrastar, múltiplos; mensagens "Solo se permiten imagenes.", "Cada imagen debe pesar maximo 12 MB.", "Error al subir imagenes: …"; grade de 5 miniaturas; tocar uma define a **portada** (`capa = {indice:i, zoom:1, x:50, y:50}`, etiqueta "Portada"); X remove (ajusta `capa.indice`); **EditorCapa** "Ajustar portada — arrastra para centrar el producto": prévia `w-32 aspect-[3/4]` idêntica ao card, arrastar muda `capa.x/y` (inverso do deslocamento, 0–100, `zoom=1`), opções "Completo (sin recortes)" (`fit contain`), "Llenar área (recorta bordes)" (`fit cover`), "Con Zoom (ideal dijes)" (`cover`, zoom 1.25), e botão "Aplicar estilo a todas las imágenes" (`confirm`; faz `upsert` de todos os produtos com `capa.{fit,zoom,x,y}` copiados mantendo o `indice` de cada um; toast "¡Aplicado a todos los productos! Los cambios se verán al recargar.").
- Rodapé: Cancelar / Guardar. Validação: nome e preço de venda obrigatórios ("Completa nombre y precio de venta"), código duplicado → "Ese código ya está en uso". Números convertidos (`precioCosto||0`, `stock||0`, `stockMinimo||5`). Toasts: "Producto creado correctamente" / "Producto actualizado correctamente" / "Error al guardar producto: <msg>".

### 9.5 Categorias (`/admin/categorias`)
Grade de cartões (imagem `h-24` ou ícone, nome, ponto ativo, descrição `line-clamp-2`, botões Activar/Desactivar, editar, eliminar com `confirm`). Inativas `opacity-60`. Modal "Nueva categoría"/"Editar categoría": **Imagen de categoria** (upload ≤ **10 MB**, `subirImagenCategoria`), Nombre* (placeholder "Ej: Collares"), Descripción (2 linhas, "Descripción breve..."), Orden de aparición (número, padrão 1), checkbox Activa. Mensagens: "El nombre es requerido", "Categoría creada correctamente", "Categoría actualizada correctamente", "Categoría eliminada" (aviso). Vazio: "Sin categorías".

### 9.6 Inventário (`/admin/inventario`)
Só produtos **ativos**. Três cartões-filtro clicáveis (alternam): **Disponibles** (`stock > stockMinimo`, verde), **Bajo stock** (`0 < stock ≤ stockMinimo`, âmbar), **Agotados** (`stock === 0`, vermelho). Busca (nome ou id, ignora `#`) + select de categoria. Tabela: Producto (miniatura + nome + categoria), Stock, Mínimo (≥sm), Estado (pílula "Agotado" / "Bajo stock" / "Disponible"), Editar (lápis). Modal "Actualizar stock": nome, "Stock actual: <n> unidades", input numérico `min=0` com autofocus ("Nueva cantidad"), Cancelar/Guardar → `actualizarStock`; inválido → toast erro "Ingresa una cantidad válida"; sucesso "Stock actualizado". Vazio: "Sin productos encontrados". (Não há histórico de movimentos.)

### 9.7 Banners (`/admin/banners`)
Lista de cartões ordenados por `orden`: imagem em **`aspect-ratio 16/5`** com selos "Activo/Inactivo" e `#orden`, título ("Sin título" se vazio) e subtítulo, botões ativar/desativar, editar, eliminar (`confirm('¿Eliminar este banner?')`). Modal "Nuevo banner"/"Editar banner" (md): imagem* ("Imagen * (formato 16:5, máx. 10 MB)", `subirImagenBanner`), Título, Subtítulo, "Enlace al hacer clic" (placeholder `/categorias o /producto/id`), Orden, checkbox Activo. Erros: "La imagen es requerida"; sucessos "Banner creado correctamente"/"Banner actualizado correctamente"/"Banner eliminado". Vazio: "Sin banners" / "Agrega el primer banner de tu tienda.".

### 9.8 Cupons (`/admin/cupones`)
Tabela: Código (mono, em chip) + nome interno; Descuento (`<valor>%` ou `$valor`); Alcance (≥lg): "Toda la tienda" / "Cat: <nome>" / "Prod: <nome>"; Expiración (≥sm; vencida em vermelho com ícone; "Sin límite"); Usos (≥md): `usosActuales` ou `usosActuales/usosMaximos`; Estado: **"Inactivo"** (!activo) / **"Vencido"** / **"Activo"**; ações editar/eliminar (`confirm('¿Eliminar este cupón?')`). Vencido = `fechaExpiracion < hoje 00:00`. Vazio: "Sin cupones" / "Crea tu primer cupón de descuento.".
Modal sm: Código* (mono, placeholder `VERANO20`), Nombre interno ("Desc. verano"), Tipo (Porcentaje (%) / Valor fijo ($)), Valor* (placeholder `20` ou `5.00`), Alcance (Toda la tienda / Por categoría / Por producto → mostra select de Categoría* ou Producto*), Fecha de expiración (date), Usos máximos ("Sin límite"), checkbox Activo.
Validações: "El código es obligatorio", "El valor debe ser mayor a 0", "El porcentaje no puede superar 100", "Selecciona una categoría", "Selecciona un producto", código repetido → "Ese código ya existe". Toasts: "Cupón creado", "Cupón actualizado", "Cupón eliminado".

### 9.9 Clientes (`/admin/clientes`)
Três cartões: Total clientes, Total comprado (Σ `totalComprado`), Promedio/cliente. Busca por nome ou telefone (`includes`). Lista: avatar inicial, nome, telefone, "<n> pedido(s)", total comprado (verde), data do último pedido, botão WhatsApp (`Hola <nombre>, te contactamos de Yeral fancy.`). Vazio: "Sin clientes aún" / "Los clientes aparecen cuando realizan su primer pedido.".
**`agregarOActualizarCliente(nombre, telefono, totalPedido, estadoPedido)`:** telefone limpo = só dígitos (vazio → erro "El cliente no tiene telefono valido"); procura local e depois no banco por `telefono`; se existe: `nombre` (novo ou antigo), `totalPedidos + 1`, `totalComprado += (estado==='Pago' ? totalPedido : 0)`, `ultimoPedido = agora`, `estadoUltimoPedido = estado` (update por telefone); senão cria `{id, nombre, telefono, totalPedidos:1, totalComprado: Pago?total:0, ultimoPedido, estadoUltimoPedido, creadoEn}`.

### 9.10 Métricas (`/admin/metricas`)
Quatro cartões: Unidades vendidas (Σ `vendidos`), Ventas confirmadas (nº pedidos `Pago`), Sin ventas (ativos com `vendidos` 0), Ganancia total (Σ `(precioVenta−precioCosto)×vendidos`). Gráfico de barras horizontais "Ranking de ventas" (top 8 por `vendidos`, nomes truncados em 16 chars, barra `#9B7B5B`); pizza "Estado de pedidos" (Pendiente, Pago, En envío, Entregado, Cancelado — só >0; paleta `['#9B7B5B','#C9A96E','#B89070','#7A5C3A','#D4B896','#E8C9A0','#6B4C2A']`, rótulo "<estado> <pct>%"; vazio "Sin datos de pedidos"); listas "Mejor ganancia" (top 5 ativos por `venta−costo`, verde), "Menos vendidos" (5 ativos de menor `vendidos`), "Sin ventas (n)" (rolagem; vazio "¡Todos tus productos han vendido!"). Cores dos gráficos mudam em modo escuro.

### 9.11 Configuração (`/admin/configuracion`)
Abas (animadas): **Tienda · Logos · Redes · Seguridad · Reset**; botão Guardar (`actualizarConfig`). Toasts: "Configuración guardada correctamente"; se `guardadoParcial` → aviso "Configuración guardada, pero falta crear logo_dark en Supabase"; "Error al guardar configuración: <msg>".
- **Tienda:** Nombre de la tienda, Descripción, Email, WhatsApp, Horario de atención (placeholder "Lunes a Sábado: 9:00 AM – 7:00 PM"), Dirección (opcional).
- **Logos:** "Logo — Modo claro" (preview, 4 logos pré-definidos `LOGOS_PRE`: Logo A `/logos/IMG_5723.PNG`, B `IMG_5720`, C `IMG_5722`, D `IMG_6107`; upload `subirImagenLogo` — só imagens, "Solo imágenes permitidas"; "O usa una URL personalizada"); "Logo — Modo oscuro" idem (campo `logoDark`). Toasts "Logo subido correctamente"/"Error al subir: <msg>".
- **Redes:** Instagram (`https://www.instagram.com/...`), TikTok (`https://www.tiktok.com/@...`).
- **Seguridad — Cambiar contraseña:** actual / nueva / confirmar (olho). Validações: "Contraseña actual incorrecta" (compara com `credenciales.contrasena`), "Mínimo 6 caracteres", "Las contraseñas no coinciden"; sucesso "Contraseña cambiada correctamente".
- **Reset de datos** (zona vermelha; `prompt` exige digitar a frase exata, senão "Reset cancelado"): `BORRAR CLIENTES` (limpia clientes), `BORRAR PEDIDOS` (pedidos), `BORRAR CATALOGO` (produtos, depois categorias), `BORRAR TODO` (pedidos, clientes, produtos, categorias, banners). Texto de confirmação: `Esta accion no se puede deshacer. Escribe "<FRASE>" para confirmar.`. Sucesso "Datos eliminados correctamente"; erro "Error al limpiar datos: <msg>". Spinner no botão ativo; todos desabilitados enquanto executa.

### 9.12 Tela de entrada da PWA
**Admin `/admin/pwa-intro` ("Pantalla PWA"):** cartão "Configuración general" com interruptor `habilitado` e select **Modo de visualización**: `siempre` "Mostrar siempre al abrir" · `primera_vez` "Solo la primera vez" · `una_vez_al_dia` "Una vez por día"; resumo "Activa · <modo>". Seção "Banners de entrada": lista (miniatura, texto do botão, estado, orden, ações) com estado vazio "Agrega un banner para personalizar la pantalla de entrada."; modal com: Imagen (recomendado 9:16 · máx. 10 MB; "Máximo 10 MB."), "Texto del botón" (padrão "Desliza para entrar"), "Color del texto de indicación" (`corHint`, padrão `#ffffff`, controla a cor do texto "Desliza para descubrir"), Orden, Activo, com pré-visualização. Toasts: "Banner PWA creado", "Banner PWA actualizado", "Banner eliminado" (confirm "¿Eliminar este banner PWA?").
**Store `usePWAIntro`:** `config {habilitado:true, modoVisualizacion:'siempre'}`; sincroniza `pwa_intro_config(id=1)` e `pwa_intro_banners` (**só substitui os banners locais se o Supabase devolver ≥1 linha**); `actualizarConfig` (local primeiro, `upsert` depois, erros ignorados); `agregarBanner`/`editarBanner`/`eliminarBanner`/`toggleActivo` são **otimistas** (local primeiro, banco depois, erros só em log); mapeador `{id,imagen,botonTexto(boton_texto||'Desliza para entrar'),corHint(cor_hint||'#ffffff'),activo,orden,creadoEn}`; `getBannersActivos()` ordenado por `orden`.
**`PWAIntroGate` (montado na loja):** mostra `PWAIntroScreen` somente se (a) roda como PWA instalada (`matchMedia('(display-mode: standalone)')` ou `navigator.standalone===true`), (b) é dispositivo móvel (UA `Android|iPhone|iPod|iPad` ou Macintosh com `maxTouchPoints>1`), (c) `config.habilitado`, (d) regra do modo: `primera_vez` → LS `yeral_pwa_intro_seen` ausente; `una_vez_al_dia` → LS `yeral_pwa_intro_last_seen` ≠ `new Date().toDateString()`; `siempre` → sempre. Ao entrar grava a marca correspondente. Usa `AnimatePresence`.
**`PWAIntroScreen`:** `fixed inset-0 z-[9999]`; fundo = imagem do banner ativo (`object-cover`, zoom suave 1.06→1 em 7 s) ou gradiente `linear-gradient(160deg,#1C1C1C 0%,#3D2B1A 55%,#7A5C3A 100%)`; degradê escuro superior/inferior; logo da loja em branco (`filter: brightness(0) invert(1)`) no topo ou monograma YF + nome; auto-rotação a cada **3 s** (swipe limiar 40 px; pontos dourados `rgba(201,169,110,.9)`); texto "Desliza para descubrir" (cor `corHint`, opacidade .7, caixa-alta); `SlideToEnterButton`. Entrada: fade 0,45 s; saída: fade + `scale 1.04`.
**`SlideToEnterButton`:** pista `h-[56px]` pílula translúcida (blur), *thumb* 52 px arrastável por Pointer Events (com `setPointerCapture`); texto some com `opacity = max(0, 1 − progresso×2.2)`; chevrons animados `›››`; se `progresso ≥ 0.82` ao soltar → completa (thumb dourado com ✔, texto "Entrando…", chama `onEntrar` após 350 ms), senão volta a 0 com *spring* (`cubic-bezier(.34,1.56,.64,1)`); animação-dica `pwaThumbHint` quando parado. `maxX = largura − 52 − 8`.

### 9.13 Importar Excel (`/admin/importar-excel`)
Fluxo: dropzone/seleção (`.xlsx`/`.xls`, ≤ **10 MB**; erros "Solo se aceptan archivos .xlsx", "El archivo supera el límite de 10 MB.") → leitura → pré-visualização paginada (**20** por página) → "Importar" → resultado + histórico (últimas **10** importações da tabela `importaciones_productos`, tolerando que a tabela não exista).
**Parser `parseInventoryExcel(buffer)`** (xlsx `cellDates:true`, 1ª aba, `header:1`): normaliza texto (minúsculas, trim, remove acentos); procura nas primeiras **25** linhas a linha de cabeçalho que tenha uma coluna de nome **e** (preço **ou** custo). Aliases (normalizados): nome `nombre|producto|nombre del producto|producto nombre`; categoria `categoría|categoria|category|tipo`; stock `cant.|cant|cantidad|stock|inventario|existencia|existencias`; custo `costo unitario|costo|precio costo|cost`; preço `precio unitario|precio|precio venta|venta|price`; notas `notas|referencia|código|codigo|sku|observación|observacion`; criado `creado|fecha|fecha creación|fecha creacion|created`. `parsearNumero`: remove tudo exceto `[0-9.,-]`, troca a primeira `,` por `.`, `NaN`→0. Para cada linha não vazia: nome vazio → item `error` ("Fila n: Nombre del producto vacío."); stock = `max(0, round(n))`; avisos: "Producto sin precio de venta." (preço 0), "Nombre duplicado en el archivo." (chave `nome|categoria` em minúsculas), "Stock inválido…"; `_estado` ∈ `valido|advertencia|error`; `gananciaUnidad = venta − costo`. Erros globais: "No se pudo leer el archivo. Asegúrate de que sea un Excel válido (.xlsx).", "El archivo no contiene hojas de cálculo.", "El archivo está vacío.", "No se encontraron columnas válidas. El archivo debe tener columnas como Nombre, Precio unitario y Cant.", "No se encontró la columna de Nombre del producto.", "No se encontraron productos en el archivo.". Retorna `{productos, errors, warnings, summary:{total,validos,conErrores,conAdvertencias,categorias[]}}`.
**Enriquecimento:** categoria casada por nome (case-insens.) com as existentes; produto existente = mesmo nome (case-insens.) **e** mesma categoria (ou ambos sem categoria) → ação `actualizar`, senão `crear`; linhas com erro → `ignorar`. Toast "Archivo leído: n producto(s) encontrado(s)." Painel de resumo: a criar / atualizar / ignorar / categorias novas.
**Importar:** para cada item (sequencial): `ignorar` conta; cria a categoria se não existir (`{nombre, descripcion:'', imagen:'', activa:true, orden: nº de categorias conhecidas}`); dados do produto `{nombre, descripcion: notas, categoriaId, precioCosto, precioVenta, stock, stockMinimo:3, fotos:[], destacado:false, activo:true}`; `actualizar` preserva `destacado` e `fotos` do existente. Falhas por linha são acumuladas (contam como ignoradas). Ao fim grava (melhor esforço) uma linha em `importaciones_productos` (`estado` = `completado` ou `con_errores`, `errores` em JSON) e mostra resultado + toast `Importación completada: <n> creados, <n> actualizados.`. Botão "reiniciar" limpa o estado.

### 9.14 Backup (`/admin/respaldo`)
**Tabelas** (ordem segura de restauração): `config, categorias, productos, clientes, pedidos, cupones, banners, pwa_intro_config, pwa_intro_banners`.
**Exportar ("Descargar respaldo completo"):** lê cada tabela (`select *`; falha → ignora a tabela com `console.warn`); varre recursivamente **todas as strings** e classifica imagens: URLs de Storage (contêm `/storage/v1/object/public/`), Telegram (começam com `/api/imagen/`), incrustadas (`data:image/`); baixa cada uma (Storage via `storage.from(bucket).download` com fallback a `fetch`; Telegram via `fetch` — só aceita se `blob.type` começa com `image/`; incrustadas via conversão de data URL) para um `JSZip` em `imagenes/<bucket>/<nombre>`, `imagenes/telegram/img_NNN.<ext>`, `imagenes/incrustadas/img_NNN.<ext>`; escreve `respaldo.json` = `{version:1, app:'yeral-fancy', fecha, tablas, imagenes: mapa{urlOriginal → {archivo,bucket,nombre | telegram:true}}}` e baixa `respaldo-yeralfancy-AAAA-MM-DD.zip` (DEFLATE). Mostra progresso ("Leyendo tabla x...", "Guardando imagen n de N...", "Comprimiendo respaldo...") e resumo `Respaldo creado: <filas> registros en <n> tablas y <n> imágenes (carpeta "imagenes" del zip).` (+ falhas). Toasts "Respaldo descargado" / "Error al crear el respaldo: <msg>".
**Restaurar:** `confirm('Restaurar un respaldo SOBRESCRIBE los datos actuales con los del archivo (los registros con el mismo código se reemplazan). ¿Continuar?')`; lê o zip, exige `respaldo.json` ("El archivo no es un respaldo válido (falta respaldo.json).") e `app==='yeral-fancy'` ("El respaldo no corresponde a esta aplicación."); re-sobe as imagens (Storage: `upload` com `upsert:true` no mesmo bucket/nome; Telegram: reenvia por `subirImagenTelegram` e, se falhar, grava no bucket `productos` como `telegram_<nome>`) montando o mapa URL antiga → nova; reescreve as strings das linhas com esse mapa; faz `upsert` por tabela em lotes de **200**, na ordem acima. Resumo `Restauración completa: <filas> registros y <n> imágenes.` (+ falhas/tabelas com erro), toast, e **recarrega a página após 2,5 s**.

### 9.15 Telegram (`/admin/telegram`)
Guia de 3 passos: (1) falar com @BotFather → `/newbot` → copiar o token; (2) criar canal privado e adicionar o bot como administrador; (3) publicar uma mensagem e usar "Buscar canales". Formulário: **Token del bot** (placeholder `123456789:AAH...`) e **ID del canal** (placeholder `-100xxxxxxxxxx`). Botões: **Guardar** (`update config set telegram_token, telegram_chat where id=1`; se o erro menciona `telegram_token` mostra aviso "Falta un paso único en Supabase" com o SQL da migração 007 e botão copiar → toast "SQL copiado"; sucesso "Configuración de Telegram guardada"), **Buscar canales** (`getUpdates` no navegador; extrai chats de `channel_post.chat | message.chat | my_chat_member.chat`; lista clicável que preenche o ID; token vazio → "Pega primero el token del bot"), **Probar conexión** (3 passos exibidos: *Bot* `getMe` → `@username`; *Canal* `sendMessage` "✅ Yeral fancy conectado — este canal archiva las imágenes de la tienda." sem notificação; *Sitio (/api/imagen)* sobe um PNG de teste por `subirImagenTelegram` e mostra a URL/preview; falha do último → "<erro> — guarda la configuración y espera el deploy; en modo local esto siempre falla").

### 9.16 Migrar imagens (`/admin/migrar-imagenes`)
Ferramenta para mover imagens do Storage para o Telegram. **Escanear:** percorre `productos, categorias, banners, config, pwa_intro_config, pwa_intro_banners`, conta URLs `/api/imagen/` existentes e coleta as URLs do Storage (`{url, tabla, filaId, nombre}`); toasts "Se encontraron n imágenes en Storage" / "No se encontraron imágenes en Storage para migrar" / "Error al escanear: <msg>". **Migrar:** `confirm("Se migrarán N imágenes del Storage al Telegram.\n\nLas imágenes originales del Storage NO se eliminan.\n¿Continuar?")`; deduplica URLs; para cada uma: baixa os bytes originais, envia por `subirImagenTelegram` (tipo pelo blob/extensão), guarda `urlVieja → urlNueva`; log em tempo real (⬇️ ⬆️ ✅ ❌), barra de progresso `actual/total`, botão **cancelar**; ao final, para cada linha afetada relê a linha e faz `upsert` com as strings reescritas. Resumo e toasts: "¡Todas las imágenes migradas a Telegram!", "Migración completada con n errores", "Migración cancelada".

---

## 10. PWA

- `vite-plugin-pwa`: `registerType:'autoUpdate'`, `injectRegister:'auto'`, `includeAssets:['favicon.ico','icons/*.png']`, workbox `skipWaiting`, `clientsClaim`, `cleanupOutdatedCaches`, `globPatterns:['**/*.{js,css,html,ico,png,svg,webp,woff2}']`, `navigateFallbackDenylist:[/^\/api\//]`.
- **Manifest:** `name`/`short_name` "Yeral fancy", descrição "Tienda de accesorios y moda femenina", `theme_color #9B7B5B`, `background_color #FFFFFF`, `display standalone`, `orientation portrait`, `scope`/`start_url` `/`, ícones `icons/pwa-192x192.svg` (192×192) e `icons/pwa-512x512.svg` (512×512, `any maskable`), ambos `image/svg+xml`. Os SVG são um monograma "YF" com fundo marrón (gerados por `generar-iconos.mjs`).
- **`index.html`:** `lang="es"`, favicon/apple-touch-icon `/logos/IMG_6107.PNG`, viewport `width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover`, `theme-color #9B7B5B`, metas Apple (`mobile-web-app-capable yes`, status bar `default`, título "Yeral fancy"), `description` "Yeral fancy – Accesorios y moda femenina. Collares, pulseras, aretes y más.", `preconnect`/`dns-prefetch` ao host do Supabase e às fontes, `<title>Yeral fancy</title>`.
- **`main.jsx`:** `StrictMode` + `BrowserRouter`; **primeiro desregistra todos os Service Workers existentes** (limpeza de cache quebrado — commit "unregister service workers") e em seguida chama `registerSW({immediate:true, onNeedRefresh(){ location.reload() }})`. Replicar nessa ordem.
- A loja funciona offline apenas com o que estiver no localStorage/cache do SW; as imagens `/api/imagen/*` são imutáveis (cache CDN de 1 ano).

---

## 11. Regras de negócio (resumo executável)

1. **Venda confirmada = pedido `Pago`.** Faturamento, lucro, ticket médio, gráfico de 7 dias e "Ventas confirmadas" só consideram `Pago`.
2. **Estoque só é descontado ao passar a `Pago`**, uma única vez (`descontadoStock`). Voltar de `Pago` para outro estado **não** repõe estoque; voltar a `Pago` **não** desconta de novo.
3. **Produto esgotado** (`stock===0`): não pode ser comprado (botões ocultos, aviso "Producto agotado por el momento."), mostra selo "Agotado"; **pouco estoque**: `0 < stock ≤ stockMinimo` → "Pocas unidades" (loja) / "Bajo stock" (admin).
4. **Ganancia por unidad** = `precioVenta − precioCosto`; **margem** = `(venta−costo)/venta×100` (0 se costo = 0).
5. **Pedido novo** sempre nasce `Pendiente` **antes** de abrir o WhatsApp; `ganancia_total = total − costo_total`.
6. **Cliente** é chaveado pelo telefone (apenas dígitos); `totalComprado` só soma quando o pedido está `Pago`.
7. **Cupom** válido se ativo, não expirado e com usos disponíveis; desconto calculado só sobre a base do alcance; o uso é contado ao criar o pedido (não ao pagar).
8. **Catálogo público** mostra só produtos `activo` e categorias `activa`; categorias e banners ordenados por `orden`.
9. **Imagens** sempre priorizam o Telegram; o banco guarda só texto/URLs.

---

## 12. Critérios de aceitação (testes manuais)

1. Com um produto de stock 5 e `stockMinimo` 5, o cartão mostra "Pocas unidades"; com stock 0 mostra "Agotado" e `/producto/:id` não exibe "Comprar ahora".
2. Adicionar 2 unidades, abrir `/carrito`, mudar quantidade, remover; o contador do header/barra inferior acompanha.
3. Checkout sem nome/telefone/ciudad mostra os 3 erros; com dados válidos cria o pedido `Pendiente` no admin, esvazia o carrinho, abre `wa.me/58<num>?text=…` com o formato do §8.14 e navega a `/pedido-creado/<id>`.
4. Cupom `10%` em "toda a loja" sobre $20 → Total $18.00 e linha "Cupón X: -$2.00"; cupom expirado → mensagem de erro do §8.12.
5. No admin, mudar um pedido para `Pago`: stock diminui, `vendidos` aumenta, Dashboard/Métricas somam; trocar `Pago → Entregado → Pago` não altera o stock de novo.
6. Login com `admin`/`yeralfancy2024` entra; senha errada mostra o erro; recarregar mantém a sessão; "Cerrar sesión" volta ao login.
7. Importar um .xlsx com colunas "Nombre / Categoría / Precio unitario / Cant." cria produtos e categorias novas e registra o histórico.
8. Exportar backup gera `.zip` com `respaldo.json` + `imagenes/…`; restaurá-lo em um banco vazio recompõe tudo e recarrega.
9. `npm run build` termina sem erros e o site instala como PWA (manifest válido, `display: standalone`).

---

## 13. Requisitos não funcionais

- **Mobile-first**, funcional de 320 px a desktop; safe-areas iOS; toques com feedback (`active:scale-95`).
- **Performance:** rotas do admin e telas secundárias em *lazy chunks*; skeletons enquanto `isReady=false`; imagens com `loading="lazy"` / `decoding="async"` nos cartões; banner principal `eager` + `fetchPriority="high"`.
- **Acessibilidade mínima:** `alt` nas imagens, `aria-label="Contactar por WhatsApp"`, `lang="es"`.
- **Resiliência:** falhas do Supabase não quebram a UI (warn + cache local); uploads têm 3 níveis de fallback; CRUD lança erros que a UI mostra em toast.
- **Segurança de imagens:** validar magic bytes, bloquear SVG, `nosniff` + CSP no proxy, token do bot nunca exposto.

---

## 14. Variáveis e configuração externa — passo a passo de implantação

1. Criar projeto Supabase; executar `supabase/migrations/001…008` (ou `supabase/setup.sql`, consolidado) no SQL Editor; criar buckets públicos `logos`, `banners`, `productos` (o `categorias` já vem da migração 003).
2. Definir `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no Vercel (e em `.env` local).
3. Fazer deploy no Vercel (framework Vite). 
4. Entrar em `/admin/login`, trocar a senha padrão em Configuração → Seguridad.
5. (Opcional, recomendado) Em `/admin/telegram` salvar token + ID do canal e testar; assim todas as imagens novas irão ao Telegram.

---

## 15. Arquivos auxiliares do repositório (não fazem parte do app em runtime)

`generar-iconos.mjs` (gera os SVG PWA), `migrar_dados.mjs`, `importar_backup.mjs`, `corrigir_backup.mjs` (scripts pontuais de migração de dados), `test.cjs`, pasta `backup_temp/`, `supabase/setup.sql` (schema consolidado em UTF-16). Podem ser omitidos num clone.

---

## 16. Roteiro sugerido de construção

1. Scaffold Vite + Tailwind + dependências; tokens, CSS global, `index.html`, config PWA.
2. `lib/supabase.js` (cliente + mapeadores + uploads), utils, hooks.
3. Stores e `InicializadorSupabase`.
4. Componentes de UI + layouts + roteamento (`App.jsx`, lazy).
5. Loja: Inicio → Categorias → Producto → Carrito → Checkout → PedidoCreado → Buscar/Favoritos/Sobre; PWAIntro.
6. Admin: Login/Layout/Sidebar → Productos/Categorias/Inventario → Pedidos/Clientes → Dashboard/Métricas → Banners/Cupones/Configuración → ImportarExcel/Respaldo/Telegram/MigrarImagenes/PWAIntro.
7. Funções `/api/imagen`.
8. `npm run build`, verificação manual dos critérios do §12.

---

## 17. Peculiaridades conhecidas (comportamento atual — replicar ou corrigir conscientemente)

1. **Autenticação fraca:** usuário/senha em texto puro na tabela `credenciales_admin`, lidos pelo navegador; RLS aberto para `anon` em todas as tabelas (qualquer pessoa com a chave anon pode ler/escrever). Evolução recomendada: Supabase Auth + RLS por papel.
2. **Dashboard sem "rango personalizado"** (o brief original pedia); só Hoy/Esta semana/Este mes.
3. **Banners:** o admin diz 16:5, mas o carrossel da loja usa `aspect-ratio 21/9`.
4. **Cliente duplicado em contagem:** o checkout chama `agregarOActualizarCliente(...,'Pendiente')` (já soma +1 pedido) e, ao marcar `Pago` no admin, chama de novo (soma +1 e `totalComprado`). Assim `totalPedidos` conta duas vezes um pedido pago.
5. **`alcance` do cupom:** o default do SQL é `'total'` mas o app só entende `todo|categoria|producto` (`cuponDeDB` mapeia vazio → `todo`; um valor `'total'` não aplica desconto). `usos_maximos` default 100 no SQL, mas o formulário envia `null` quando vazio.
6. **`usePedidos` não persiste** e `/pedido-creado/:id` depende do pedido estar no estado em memória (reload imediato mostra "Pedido no encontrado" até a sincronização; o pedido existe no banco).
7. **`TarjetaProducto` ignora a prop `onAgregarAlCarrito`**; o toast só aparece na página de produto.
8. **Service Worker:** `main.jsx` desregistra todos os SW e logo registra o novo — efeito prático: cache offline pouco confiável.
9. **Estoque não é restaurado** ao cancelar um pedido já pago; **sem histórico de movimentos de estoque**; sem "reposição urgente" separada (apenas "Bajo stock"/"Agotado").
10. **Dashboard/Métricas "ganancia total"** em Métricas usa `vendidos × (venta−costo)` do produto (preço atual), não a soma dos pedidos pagos.
11. **Mensagens de componentes visuais** em português dentro de comentários de código; ignoráveis.
12. `BotonWhatsApp` existe mas não está montado em nenhuma tela.
