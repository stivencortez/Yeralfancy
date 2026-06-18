import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { TarjetaProducto } from '../../components/tienda/TarjetaProducto'
import { useTiendaToast } from '../../layouts/LayoutTienda'
import { useFavoritos } from '../../store/useFavoritos'
import { useProductos } from '../../store/useProductos'
import { EstadoVacio } from '../../components/ui/Cargando'

export default function Favoritos() {
  const favoritos = useFavoritos(s => s.favoritos)
  const getProducto = useProductos(s => s.getProducto)
  const mostrarToast = useTiendaToast()

  const productos = favoritos.map(id => getProducto(id)).filter(Boolean)

  if (!productos.length) {
    return (
      <EstadoVacio
        icono="🤍"
        titulo="Sin favoritos aún"
        descripcion="Guarda tus productos favoritos tocando el corazón."
        accion={
          <Link to="/" className="btn-primario mt-4 inline-flex items-center gap-2">
            Explorar tienda
          </Link>
        }
      />
    )
  }

  return (
    <div className="contenedor py-5 animate-fade-in">
      <h1 className="font-bold text-xl text-marca-negro mb-5 flex items-center gap-2">
        <Heart size={20} className="text-red-400 fill-red-400" />
        Favoritos ({productos.length})
      </h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {productos.map(p => (
          <TarjetaProducto
            key={p.id}
            producto={p}
            onAgregarAlCarrito={() => mostrarToast('Producto agregado al carrito', 'exito')}
          />
        ))}
      </div>
    </div>
  )
}
