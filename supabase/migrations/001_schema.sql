-- ============================================================
-- YERAL FANCY — Schema inicial
-- Pegar y ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── CATEGORIAS ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.categorias (
  id          TEXT PRIMARY KEY,
  nombre      TEXT NOT NULL,
  descripcion TEXT DEFAULT '',
  imagen      TEXT DEFAULT '',
  activa      BOOLEAN DEFAULT true,
  orden       INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all_categorias" ON public.categorias;
CREATE POLICY "anon_all_categorias" ON public.categorias
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ─── PRODUCTOS ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.productos (
  id           TEXT PRIMARY KEY,
  nombre       TEXT NOT NULL,
  descripcion  TEXT DEFAULT '',
  categoria_id TEXT REFERENCES public.categorias(id) ON DELETE SET NULL,
  precio_costo NUMERIC(10,2) DEFAULT 0,
  precio_venta NUMERIC(10,2) DEFAULT 0,
  stock        INTEGER DEFAULT 0,
  stock_minimo INTEGER DEFAULT 5,
  fotos        TEXT[] DEFAULT '{}',
  destacado    BOOLEAN DEFAULT false,
  activo       BOOLEAN DEFAULT true,
  vendidos     INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all_productos" ON public.productos;
CREATE POLICY "anon_all_productos" ON public.productos
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ─── PEDIDOS ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.pedidos (
  id                TEXT PRIMARY KEY,
  cliente_nombre    TEXT NOT NULL,
  cliente_telefono  TEXT NOT NULL,
  items             JSONB DEFAULT '[]',
  total             NUMERIC(10,2) DEFAULT 0,
  costo_total       NUMERIC(10,2) DEFAULT 0,
  ganancia_total    NUMERIC(10,2) DEFAULT 0,
  estado            TEXT DEFAULT 'Pendiente',
  descontado_stock  BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all_pedidos" ON public.pedidos;
CREATE POLICY "anon_all_pedidos" ON public.pedidos
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ─── CLIENTES ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.clientes (
  id                    TEXT PRIMARY KEY,
  nombre                TEXT DEFAULT '',
  telefono              TEXT UNIQUE,
  total_pedidos         INTEGER DEFAULT 0,
  total_comprado        NUMERIC(10,2) DEFAULT 0,
  ultimo_pedido         TIMESTAMPTZ,
  estado_ultimo_pedido  TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all_clientes" ON public.clientes;
CREATE POLICY "anon_all_clientes" ON public.clientes
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ─── BANNERS ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.banners (
  id         TEXT PRIMARY KEY,
  titulo     TEXT DEFAULT '',
  subtitulo  TEXT DEFAULT '',
  imagen     TEXT DEFAULT '',
  enlace     TEXT DEFAULT '',
  activo     BOOLEAN DEFAULT true,
  orden      INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all_banners" ON public.banners;
CREATE POLICY "anon_all_banners" ON public.banners
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ─── CONFIG ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.config (
  id          INTEGER PRIMARY KEY DEFAULT 1,
  nombre      TEXT DEFAULT 'Yeral fancy',
  logo        TEXT DEFAULT '',
  logo_dark   TEXT DEFAULT '',
  descripcion TEXT DEFAULT '',
  whatsapp    TEXT DEFAULT '04243677705',
  email       TEXT DEFAULT 'Yeralfancy2023@gmail.com',
  instagram   TEXT DEFAULT '',
  tiktok      TEXT DEFAULT '',
  direccion   TEXT DEFAULT '',
  horario     TEXT DEFAULT 'Lunes a Sábado: 9:00 AM – 7:00 PM',
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all_config" ON public.config;
CREATE POLICY "anon_all_config" ON public.config
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ─── CREDENCIALES ADMIN ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.credenciales_admin (
  id         INTEGER PRIMARY KEY DEFAULT 1,
  usuario    TEXT NOT NULL DEFAULT 'admin',
  contrasena TEXT NOT NULL DEFAULT 'yeralfancy2024'
);

ALTER TABLE public.credenciales_admin ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all_credenciales" ON public.credenciales_admin;
CREATE POLICY "anon_all_credenciales" ON public.credenciales_admin
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ─── DATOS INICIALES ──────────────────────────────────────────────────────────

INSERT INTO public.config (id, nombre, descripcion, whatsapp, email, instagram, tiktok, horario)
VALUES (
  1, 'Yeral fancy',
  'Somos Yeral fancy, tu tienda de accesorios y moda femenina. Encontrarás collares, pulseras, aretes, anillos y mucho más. Todo diseñado para hacerte brillar.',
  '04243677705', 'Yeralfancy2023@gmail.com',
  'https://www.instagram.com/yeral.fancy?igsh=MXVjYjNkeHJ4cXdhNg%3D%3D&utm_source=qr',
  'https://www.tiktok.com/@yeralfancy?_r=1&_t=ZN-97IEeNgVkhi',
  'Lunes a Sábado: 9:00 AM – 7:00 PM'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.credenciales_admin (id, usuario, contrasena)
VALUES (1, 'admin', 'yeralfancy2024')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.categorias (id, nombre, descripcion, imagen, activa, orden) VALUES
('cat1', 'Collares',   'Collares elegantes para toda ocasión',  'https://picsum.photos/seed/collares/400/300',  true, 1),
('cat2', 'Pulseras',   'Pulseras finas y llamativas',           'https://picsum.photos/seed/pulseras/400/300',  true, 2),
('cat3', 'Aretes',     'Aretes y zarcillos de diseño',          'https://picsum.photos/seed/aretes/400/300',    true, 3),
('cat4', 'Anillos',    'Anillos delicados y modernos',          'https://picsum.photos/seed/anillos/400/300',   true, 4),
('cat5', 'Carteras',   'Bolsos y carteras de moda',             'https://picsum.photos/seed/carteras/400/300',  true, 5),
('cat6', 'Accesorios', 'Todo tipo de accesorios femeninos',     'https://picsum.photos/seed/accesorios/400/300',true, 6),
('cat7', 'Ropa',       'Prendas femeninas de temporada',        'https://picsum.photos/seed/ropa/400/300',      true, 7),
('cat8', 'Ofertas',    'Productos en oferta especial',          'https://picsum.photos/seed/ofertas/400/300',   true, 8)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.productos
  (id, nombre, descripcion, categoria_id, precio_costo, precio_venta, stock, stock_minimo, fotos, destacado, activo, vendidos)
VALUES
('prod1','Collar Perlas Doradas','Elegante collar de perlas artificiales con cadena dorada. Perfecto para cualquier ocasión.',
 'cat1',4.50,14.99,25,5, ARRAY['https://picsum.photos/seed/prod1a/600/600','https://picsum.photos/seed/prod1b/600/600'],true,true,18),
('prod2','Pulsera Minimalista Rosa','Pulsera delicada con dijes en tono rosado. Diseño minimalista y femenino.',
 'cat2',3.00,9.99,30,8, ARRAY['https://picsum.photos/seed/prod2a/600/600','https://picsum.photos/seed/prod2b/600/600'],true,true,32),
('prod3','Aretes Flor de Resina','Hermosos aretes con diseño floral en resina de colores. Livianos y cómodos.',
 'cat3',2.50,8.99,15,5, ARRAY['https://picsum.photos/seed/prod3a/600/600'],false,true,45),
('prod4','Anillo Corazón Ajustable','Anillo con diseño de corazón, ajustable. Bañado en oro 18k.',
 'cat4',3.50,11.99,20,5, ARRAY['https://picsum.photos/seed/prod4a/600/600','https://picsum.photos/seed/prod4b/600/600'],true,true,27),
('prod5','Cartera Moño Elegante','Mini cartera con detalle de moño. Ideal para salidas y eventos especiales.',
 'cat5',8.00,24.99,10,3, ARRAY['https://picsum.photos/seed/prod5a/600/600'],true,true,12),
('prod6','Set Collar y Aretes Plata','Conjunto coordinado de collar y aretes en plata. Elegante y versátil.',
 'cat1',7.00,19.99,3,5, ARRAY['https://picsum.photos/seed/prod6a/600/600','https://picsum.photos/seed/prod6b/600/600'],true,true,8),
('prod7','Pulsera Charms Dorada','Pulsera dorada con múltiples charms decorativos. Moda y estilo en tu muñeca.',
 'cat2',4.00,12.99,0,5, ARRAY['https://picsum.photos/seed/prod7a/600/600'],false,true,22),
('prod8','Collar Mariposa Doble','Collar con dos mariposas superpuestas bañadas en oro. Delicado y llamativo.',
 'cat1',5.50,16.99,18,5, ARRAY['https://picsum.photos/seed/prod8a/600/600','https://picsum.photos/seed/prod8b/600/600','https://picsum.photos/seed/prod8c/600/600'],false,true,15)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.banners (id, titulo, subtitulo, imagen, enlace, activo, orden) VALUES
('ban1','Nueva Colección','Accesorios que cuentan tu historia','https://picsum.photos/seed/banner1/800/250','/categorias',true,1),
('ban2','Ofertas Especiales','Hasta 30% de descuento en selección','https://picsum.photos/seed/banner2/800/250','/categorias/cat8',true,2)
ON CONFLICT (id) DO NOTHING;
