import { Link } from 'react-router-dom'
import { useCategorias } from '../../store/useCategorias'
import { useProductos } from '../../store/useProductos'

export default function Categorias() {
  const categorias = useCategorias(s => s.getActivas())
  const productos = useProductos(s => s.getProductosActivos())

  return (
    <div className="contenedor py-5 animate-fade-in">
      <h1 className="font-bold text-xl text-marca-negro mb-5">Categorías</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categorias.map((cat) => {
          const cantProductos = productos.filter(p => p.categoriaId === cat.id).length
          return (
            <Link
              key={cat.id}
              to={`/categorias/${cat.id}`}
              className="group block bg-white rounded-2xl overflow-hidden shadow-tarjeta hover:shadow-tarjeta-hover transition-all duration-300"
            >
              <div className="aspect-video overflow-hidden bg-marca-beige">
                {cat.imagen ? (
                  <img
                    src={cat.imagen}
                    alt={cat.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">💎</div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-marca-negro text-sm">{cat.nombre}</h3>
                <p className="text-xs text-marca-texto-suave mt-0.5">{cantProductos} productos</p>
              </div>
            </Link>
          )
        })}
      </div>

      {!categorias.length && (
        <div className="py-16 text-center">
          <p className="text-4xl mb-4">📂</p>
          <p className="font-semibold text-marca-negro">Sin categorías aún</p>
        </div>
      )}
    </div>
  )
}
