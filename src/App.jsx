import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { LayoutTienda } from './layouts/LayoutTienda'
import InicializadorSupabase from './components/ui/InicializadorSupabase'
import ScrollToTop from './components/ui/ScrollToTop'

// ── Tienda: carga inmediata (ruta principal de clientes) ──
import Inicio from './pages/tienda/Inicio'
import Categorias from './pages/tienda/Categorias'
import CategoriaDetalle from './pages/tienda/CategoriaDetalle'
import Producto from './pages/tienda/Producto'
import Carrito from './pages/tienda/Carrito'

// ── Tienda: lazy (menos críticas) ──
const Favoritos     = lazy(() => import('./pages/tienda/Favoritos'))
const Checkout      = lazy(() => import('./pages/tienda/Checkout'))
const PedidoCreado  = lazy(() => import('./pages/tienda/PedidoCreado'))
const Buscar        = lazy(() => import('./pages/tienda/Buscar'))
const Sobre         = lazy(() => import('./pages/tienda/Sobre'))

// ── Admin: lazy (el cliente de la tienda NUNCA descarga esto) ──
const LayoutAdmin   = lazy(() => import('./layouts/LayoutAdmin').then(m => ({ default: m.LayoutAdmin })))
const Login         = lazy(() => import('./pages/admin/Login'))
const Dashboard     = lazy(() => import('./pages/admin/Dashboard'))
const Productos     = lazy(() => import('./pages/admin/Productos'))
const CategoriasAdmin = lazy(() => import('./pages/admin/CategoriasAdmin'))
const Inventario    = lazy(() => import('./pages/admin/Inventario'))
const Pedidos       = lazy(() => import('./pages/admin/Pedidos'))
const Banners       = lazy(() => import('./pages/admin/Banners'))
const Clientes      = lazy(() => import('./pages/admin/Clientes'))
const Metricas      = lazy(() => import('./pages/admin/Metricas'))
const Configuracion = lazy(() => import('./pages/admin/Configuracion'))
const PWAIntro      = lazy(() => import('./pages/admin/PWAIntro'))
const ImportarExcel = lazy(() => import('./pages/admin/ImportarExcel'))
const Cupones       = lazy(() => import('./pages/admin/Cupones'))
const Respaldo      = lazy(() => import('./pages/admin/Respaldo'))
const Telegram      = lazy(() => import('./pages/admin/Telegram'))
const MigrarImagenes = lazy(() => import('./pages/admin/MigrarImagenes'))

// Spinner mínimo para el Suspense boundary
function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 border-2 border-marca-beige-borde border-t-marca-marron rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <>
      <InicializadorSupabase />
      <ScrollToTop />
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route element={<LayoutTienda />}>
            <Route path="/" element={<Inicio />} />
            <Route path="/categorias" element={<Categorias />} />
            <Route path="/categorias/:id" element={<CategoriaDetalle />} />
            <Route path="/producto/:id" element={<Producto />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/favoritos" element={<Favoritos />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/pedido-creado/:id" element={<PedidoCreado />} />
            <Route path="/buscar" element={<Buscar />} />
            <Route path="/sobre" element={<Sobre />} />
          </Route>

          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<LayoutAdmin />}>
            <Route index element={<Dashboard />} />
            <Route path="productos" element={<Productos />} />
            <Route path="categorias" element={<CategoriasAdmin />} />
            <Route path="inventario" element={<Inventario />} />
            <Route path="pedidos" element={<Pedidos />} />
            <Route path="banners" element={<Banners />} />
            <Route path="pwa-intro" element={<PWAIntro />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="metricas" element={<Metricas />} />
            <Route path="configuracion" element={<Configuracion />} />
            <Route path="importar-excel" element={<ImportarExcel />} />
            <Route path="cupones" element={<Cupones />} />
            <Route path="respaldo" element={<Respaldo />} />
            <Route path="telegram" element={<Telegram />} />
            <Route path="migrar-imagenes" element={<MigrarImagenes />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  )
}
