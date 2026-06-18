import { Routes, Route } from 'react-router-dom'
import { LayoutTienda } from './layouts/LayoutTienda'
import { LayoutAdmin } from './layouts/LayoutAdmin'
import InicializadorSupabase from './components/ui/InicializadorSupabase'

import Inicio from './pages/tienda/Inicio'
import Categorias from './pages/tienda/Categorias'
import CategoriaDetalle from './pages/tienda/CategoriaDetalle'
import Producto from './pages/tienda/Producto'
import Carrito from './pages/tienda/Carrito'
import Favoritos from './pages/tienda/Favoritos'
import Checkout from './pages/tienda/Checkout'
import PedidoCreado from './pages/tienda/PedidoCreado'
import Buscar from './pages/tienda/Buscar'
import Sobre from './pages/tienda/Sobre'

import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import Productos from './pages/admin/Productos'
import CategoriasAdmin from './pages/admin/CategoriasAdmin'
import Inventario from './pages/admin/Inventario'
import Pedidos from './pages/admin/Pedidos'
import Banners from './pages/admin/Banners'
import Clientes from './pages/admin/Clientes'
import Metricas from './pages/admin/Metricas'
import Configuracion from './pages/admin/Configuracion'
import PWAIntro from './pages/admin/PWAIntro'

export default function App() {
  return (
    <>
      <InicializadorSupabase />
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
        </Route>
      </Routes>
    </>
  )
}
