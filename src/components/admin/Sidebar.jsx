import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/useAuth'
import { useConfig } from '../../store/useConfig'
import {
  LayoutDashboard, Package, Tag, Warehouse, ShoppingCart,
  Image, Users, BarChart2, Settings, LogOut, Globe,
  ChevronLeft, ChevronRight, Sun, Moon, Smartphone, FileSpreadsheet, Ticket, Database,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── Grupos de navegación ─────────────────────────────────────────────────── */
const GRUPOS = [
  {
    titulo: 'Principal',
    items: [
      { a: '/admin',         icono: LayoutDashboard, etiqueta: 'Dashboard', exacto: true },
      { a: '/admin/pedidos', icono: ShoppingCart,     etiqueta: 'Pedidos' },
    ],
  },
  {
    titulo: 'Catálogo',
    items: [
      { a: '/admin/productos',  icono: Package,   etiqueta: 'Productos' },
      { a: '/admin/categorias', icono: Tag,       etiqueta: 'Categorías' },
      { a: '/admin/inventario', icono: Warehouse, etiqueta: 'Inventario' },
      { a: '/admin/banners',         icono: Image,            etiqueta: 'Banners' },
      { a: '/admin/cupones',        icono: Ticket,           etiqueta: 'Cupones' },
      { a: '/admin/importar-excel', icono: FileSpreadsheet,  etiqueta: 'Importar Excel' },
      { a: '/admin/pwa-intro',      icono: Smartphone,       etiqueta: 'Pantalla PWA' },
    ],
  },
  {
    titulo: 'Análisis',
    items: [
      { a: '/admin/clientes', icono: Users,    etiqueta: 'Clientes' },
      { a: '/admin/metricas', icono: BarChart2, etiqueta: 'Métricas' },
    ],
  },
  {
    titulo: 'Sistema',
    items: [
      { a: '/admin/configuracion', icono: Settings, etiqueta: 'Configuración' },
      { a: '/admin/respaldo',      icono: Database, etiqueta: 'Respaldo' },
    ],
  },
]

/* ─── Variante de texto que aparece/desaparece según el estado ─────────────── */
const labelVariants = {
  hidden: { opacity: 0, width: 0, marginLeft: 0 },
  show:   { opacity: 1, width: 'auto', marginLeft: 12, transition: { duration: 0.18, ease: 'easeOut' } },
  exit:   { opacity: 0, width: 0, marginLeft: 0,      transition: { duration: 0.12, ease: 'easeIn' } },
}

/* ─── NavItem ──────────────────────────────────────────────────────────────── */
function NavItem({ a, icono: Icono, etiqueta, exacto, onCerrar, expanded }) {
  return (
    <NavLink
      to={a}
      end={exacto}
      onClick={onCerrar}
      title={!expanded ? etiqueta : undefined}
      className={({ isActive }) =>
        `relative flex items-center rounded-xl text-sm font-medium overflow-hidden
         transition-colors duration-150 select-none
         ${expanded ? 'px-3 py-2.5' : 'justify-center py-2.5 px-0'}
         ${isActive
           ? 'bg-marca-beige text-marca-marron-oscuro'
           : 'text-marca-texto-suave hover:bg-marca-beige/70 hover:text-marca-negro'
         }`
      }
    >
      {({ isActive }) => (
        <>
          {/* Active left bar — only in expanded mode */}
          {isActive && expanded && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-marca-marron" />
          )}
          <Icono size={16} strokeWidth={isActive ? 2.2 : 1.7} className="shrink-0 relative z-10" />
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.span
                key="label"
                variants={labelVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="whitespace-nowrap overflow-hidden relative z-10"
              >
                {etiqueta}
              </motion.span>
            )}
          </AnimatePresence>
        </>
      )}
    </NavLink>
  )
}

/* ─── GroupHeader ──────────────────────────────────────────────────────────── */
function GroupHeader({ titulo, expanded, hasDivider }) {
  return (
    <AnimatePresence initial={false} mode="wait">
      {expanded ? (
        <motion.div
          key="header"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.05, duration: 0.18 } }}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
          className="flex items-center gap-2 px-3 mb-1"
        >
          <span className="text-[9px] font-bold uppercase tracking-widest text-marca-texto-suave/50 whitespace-nowrap">
            {titulo}
          </span>
          <div className="flex-1 h-px bg-marca-beige-borde/60" />
        </motion.div>
      ) : hasDivider ? (
        <motion.div
          key="divider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="my-2 h-px bg-marca-beige-borde/50"
        />
      ) : null}
    </AnimatePresence>
  )
}

/* ─── ThemeToggle ──────────────────────────────────────────────────────────── */
function ThemeToggle({ modoOscuro, toggle, expanded }) {
  return (
    <button
      onClick={toggle}
      title={!expanded ? (modoOscuro ? 'Cambiar a claro' : 'Cambiar a oscuro') : undefined}
      className={`w-full flex items-center rounded-xl text-sm font-medium
                  text-marca-texto-suave hover:bg-marca-beige/70 hover:text-marca-negro
                  transition-all duration-150 py-2.5
                  ${expanded ? 'px-3 justify-between' : 'justify-center px-0'}`}
    >
      <span className="flex items-center gap-0 shrink-0">
        {modoOscuro
          ? <Moon size={16} strokeWidth={1.7} />
          : <Sun  size={16} strokeWidth={1.7} />
        }
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.span
              key="label"
              variants={labelVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="whitespace-nowrap overflow-hidden"
            >
              {modoOscuro ? 'Modo oscuro' : 'Modo claro'}
            </motion.span>
          )}
        </AnimatePresence>
      </span>

      {/* Pill switch — visible only when expanded */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.span
            key="pill"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.15 } }}
            exit={{ opacity: 0, scale: 0.8,  transition: { duration: 0.1 } }}
            className="relative w-10 h-[22px] rounded-full shrink-0 transition-colors duration-300"
            style={{ backgroundColor: modoOscuro ? 'rgba(201,169,110,0.28)' : '#E8D8C0' }}
          >
            <span
              className="absolute top-[3px] w-4 h-4 rounded-full shadow-sm transition-all duration-300"
              style={{
                left: modoOscuro ? '22px' : '3px',
                backgroundColor: modoOscuro ? '#C9A96E' : '#9B7B5B',
              }}
            />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

/* ─── LogoBlock ────────────────────────────────────────────────────────────── */
function LogoBlock({ logoActual, nombre, expanded }) {
  return (
    <AnimatePresence initial={false} mode="wait">
      {expanded ? (
        <motion.div
          key="exp"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.06, duration: 0.18 } }}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
          className="flex items-center gap-3 min-w-0 overflow-hidden"
        >
          {logoActual ? (
            <img src={logoActual} alt={nombre} className="h-8 w-auto max-w-[128px] object-contain" />
          ) : (
            <>
              <Monograma />
              <div className="min-w-0">
                <p className="font-display font-bold text-marca-negro text-sm leading-tight truncate">{nombre}</p>
                <p className="text-[10px] text-marca-texto-suave tracking-wide">Panel Admin</p>
              </div>
            </>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.15 } }}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
        >
          {logoActual ? (
            <img src={logoActual} alt="" className="h-7 w-7 object-contain rounded-lg" />
          ) : (
            <Monograma />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Monograma() {
  return (
    <div className="w-8 h-8 bg-gradient-to-br from-marca-marron to-marca-marron-oscuro rounded-xl flex items-center justify-center shrink-0">
      <span className="text-white font-bold text-xs font-display select-none">YF</span>
    </div>
  )
}

/* ─── SidebarInner — contenido compartido entre desktop y drawer ───────────── */
function SidebarInner({ expanded, onCerrar, isDrawer, modoOscuro, toggleModoOscuro, logoActual, nombre, onToggleExpandido, onLogout }) {
  return (
    <div className="flex flex-col h-full">

      {/* ── Header ── */}
      <div
        className={`h-[60px] flex items-center border-b border-marca-beige-borde shrink-0
                    transition-all duration-300
                    ${expanded ? 'px-4 justify-between gap-3' : 'px-0 justify-center'}`}
      >
        <LogoBlock logoActual={logoActual} nombre={nombre} expanded={expanded} />

        {/* Colapsar / Expandir — solo desktop */}
        {!isDrawer && (
          <button
            onClick={onToggleExpandido}
            className="p-1.5 rounded-lg text-marca-texto-suave hover:bg-marca-beige hover:text-marca-negro
                       transition-all duration-150 shrink-0"
          >
            {expanded
              ? <ChevronLeft  size={15} strokeWidth={2} />
              : <ChevronRight size={15} strokeWidth={2} />
            }
          </button>
        )}

        {/* Cerrar — solo drawer mobile */}
        {isDrawer && (
          <button
            onClick={onCerrar}
            className="p-1.5 rounded-lg text-marca-texto-suave hover:bg-marca-beige hover:text-marca-negro
                       transition-colors duration-150 shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      {/* ── Navegación ── */}
      <nav
        className={`flex-1 overflow-y-auto overflow-x-hidden py-3
                    ${expanded ? 'px-3' : 'px-2'}`}
      >
        {GRUPOS.map((grupo, gi) => (
          <div key={grupo.titulo} className={gi > 0 ? 'mt-1' : ''}>
            <GroupHeader titulo={grupo.titulo} expanded={expanded} hasDivider={gi > 0} />
            <div className="space-y-0.5">
              {grupo.items.map(item => (
                <NavItem key={item.a} {...item} onCerrar={onCerrar} expanded={expanded} />
              ))}
            </div>
          </div>
        ))}

        {/* Accesos: Ver tienda */}
        <div className="mt-1">
          <GroupHeader titulo="Accesos" expanded={expanded} hasDivider />
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title={!expanded ? 'Ver tienda' : undefined}
            className={`flex items-center rounded-xl text-sm font-medium overflow-hidden
                        text-marca-texto-suave hover:bg-marca-beige/70 hover:text-marca-negro
                        transition-colors duration-150 py-2.5
                        ${expanded ? 'px-3' : 'justify-center px-0'}`}
          >
            <Globe size={16} strokeWidth={1.7} className="shrink-0" />
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.span
                  key="label"
                  variants={labelVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="whitespace-nowrap overflow-hidden"
                >
                  Ver tienda
                </motion.span>
              )}
            </AnimatePresence>
          </a>
        </div>
      </nav>

      {/* ── Footer ── */}
      <div
        className={`border-t border-marca-beige-borde shrink-0 py-2
                    ${expanded ? 'px-3' : 'px-2'}`}
      >
        <ThemeToggle modoOscuro={modoOscuro} toggle={toggleModoOscuro} expanded={expanded} />

        {/* Separador sutil */}
        <div className="my-1 h-px bg-marca-beige-borde/50" />

        <button
          onClick={onLogout}
          title={!expanded ? 'Cerrar sesión' : undefined}
          className={`w-full flex items-center rounded-xl text-sm font-medium overflow-hidden
                      text-red-400 hover:bg-red-50 hover:text-red-600
                      transition-all duration-150 py-2.5
                      ${expanded ? 'px-3' : 'justify-center px-0'}`}
        >
          <LogOut size={16} strokeWidth={1.7} className="shrink-0" />
          <AnimatePresence initial={false}>
            {expanded && (
              <motion.span
                key="label"
                variants={labelVariants}
                initial="hidden"
                animate="show"
                exit="exit"
                className="whitespace-nowrap overflow-hidden"
              >
                Cerrar sesión
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  )
}

/* ─── Sidebar principal ────────────────────────────────────────────────────── */
export function Sidebar({ abierto, onCerrar, modoOscuro, toggleModoOscuro, expandido, onToggleExpandido }) {
  const cerrarSesion = useAuth(s => s.cerrarSesion)
  const navigate     = useNavigate()
  const config       = useConfig(s => s.config)

  const logoActual = modoOscuro && config.logoDark ? config.logoDark : config.logo

  const handleLogout = () => {
    cerrarSesion()
    navigate('/admin/login')
  }

  const innerProps = {
    modoOscuro,
    toggleModoOscuro,
    logoActual,
    nombre: config.nombre,
    onCerrar,
    onLogout: handleLogout,
  }

  return (
    <>
      {/* ── Mobile: overlay + drawer ── */}
      <AnimatePresence>
        {abierto && (
          <>
            <motion.div
              key="overlay"
              className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={onCerrar}
            />
            {/*
              Não usamos bg-white em dark: `.dark .bg-white` (spec 0,2,0) venceria
              `.dark aside` (spec 0,1,1) e aplicaria cor de card ao invés de surface.
              Sem bg-white, `.dark aside { background-color: var(--dk-surface) }` aplica corretamente.
            */}
            <motion.aside
              key="drawer"
              className={`fixed top-0 left-0 h-full w-[260px] z-50 flex flex-col lg:hidden border-r shadow-modal transition-colors duration-300
                ${modoOscuro ? '' : 'bg-white border-marca-beige-borde'}`}
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            >
              <SidebarInner {...innerProps} expanded isDrawer onToggleExpandido={onToggleExpandido} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop: sidebar fija animada ── */}
      <motion.aside
        className={`hidden lg:flex flex-col h-screen sticky top-0 shrink-0 overflow-hidden border-r transition-colors duration-300
          ${modoOscuro ? '' : 'bg-white border-marca-beige-borde'}`}
        animate={{ width: expandido ? 240 : 68 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <SidebarInner {...innerProps} expanded={expandido} isDrawer={false} onToggleExpandido={onToggleExpandido} />
      </motion.aside>
    </>
  )
}
