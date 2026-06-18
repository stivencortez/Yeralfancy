import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../store/useAuth'

export default function Login() {
  const autenticado = useAuth(s => s.autenticado)
  const iniciarSesion = useAuth(s => s.iniciarSesion)
  const navigate = useNavigate()

  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [mostrar, setMostrar] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  if (autenticado) return <Navigate to="/admin" replace />

  const manejarLogin = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')
    await new Promise(r => setTimeout(r, 500))
    const ok = iniciarSesion(usuario, contrasena)
    if (ok) {
      navigate('/admin')
    } else {
      setError('Usuario o contraseña incorrectos')
    }
    setCargando(false)
  }

  return (
    <div className="min-h-screen bg-marca-beige flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-marca-marron rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl font-display">YF</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-marca-negro">Yeral fancy</h1>
          <p className="text-sm text-marca-texto-suave mt-1">Panel Administrativo</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-modal">
          <h2 className="font-bold text-lg text-marca-negro mb-6">Iniciar sesión</h2>
          <form onSubmit={manejarLogin} className="space-y-4">
            <div>
              <label className="etiqueta">Usuario</label>
              <input
                type="text"
                value={usuario}
                onChange={e => { setUsuario(e.target.value); setError('') }}
                placeholder="admin"
                className="input-campo"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="etiqueta">Contraseña</label>
              <div className="relative">
                <input
                  type={mostrar ? 'text' : 'password'}
                  value={contrasena}
                  onChange={e => { setContrasena(e.target.value); setError('') }}
                  placeholder="••••••••"
                  className="input-campo pr-11"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setMostrar(!mostrar)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-marca-texto-suave"
                >
                  {mostrar ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                cargando ? 'bg-marca-marron/60 cursor-not-allowed' : 'bg-marca-negro hover:bg-marca-marron-oscuro active:scale-95'
              }`}
            >
              {cargando ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : 'Entrar'}
            </button>
          </form>
          <p className="text-center text-xs text-marca-texto-suave mt-4">
            Usuario: <strong>admin</strong> · Contraseña: <strong>yeralfancy2024</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
