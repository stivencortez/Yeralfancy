import { useState } from 'react'
import { Save, Store, Share2, Lock } from 'lucide-react'
import { useConfig } from '../../store/useConfig'
import { useAuth } from '../../store/useAuth'
import { useAdminToast } from '../../layouts/LayoutAdmin'

export default function Configuracion() {
  const config = useConfig(s => s.config)
  const actualizarConfig = useConfig(s => s.actualizarConfig)
  const cambiarContrasena = useAuth(s => s.cambiarContrasena)
  const toast = useAdminToast()

  const [datos, setDatos] = useState({ ...config })
  const [pass, setPass] = useState({ actual: '', nueva: '', confirmar: '' })
  const credenciales = useAuth(s => s.credenciales)

  const guardarConfig = () => {
    actualizarConfig(datos)
    toast('Configuración guardada correctamente', 'exito')
  }

  const cambiarPass = () => {
    if (pass.actual !== credenciales.contrasena) { toast('Contraseña actual incorrecta', 'error'); return }
    if (pass.nueva.length < 6) { toast('La contraseña debe tener al menos 6 caracteres', 'error'); return }
    if (pass.nueva !== pass.confirmar) { toast('Las contraseñas no coinciden', 'error'); return }
    cambiarContrasena(pass.nueva)
    setPass({ actual: '', nueva: '', confirmar: '' })
    toast('Contraseña cambiada correctamente', 'exito')
  }

  return (
    <div className="animate-fade-in max-w-2xl">
      <h1 className="font-bold text-xl text-marca-negro mb-6">Configuración</h1>

      <div className="bg-white rounded-2xl shadow-tarjeta p-5 mb-4">
        <div className="flex items-center gap-2 mb-5">
          <Store size={18} className="text-marca-marron" />
          <h2 className="font-semibold text-marca-negro">Información de la tienda</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="etiqueta">Nombre de la tienda</label>
            <input value={datos.nombre} onChange={e => setDatos(d => ({ ...d, nombre: e.target.value }))} className="input-campo" />
          </div>
          <div>
            <label className="etiqueta">URL del logo</label>
            <input value={datos.logo || ''} onChange={e => setDatos(d => ({ ...d, logo: e.target.value }))} className="input-campo" placeholder="https://..." />
            {datos.logo && <img src={datos.logo} alt="Logo" className="w-16 h-16 rounded-xl object-contain bg-marca-beige mt-2" />}
          </div>
          <div>
            <label className="etiqueta">Descripción</label>
            <textarea value={datos.descripcion} onChange={e => setDatos(d => ({ ...d, descripcion: e.target.value }))} className="input-campo resize-none" rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="etiqueta">Email</label>
              <input type="email" value={datos.email} onChange={e => setDatos(d => ({ ...d, email: e.target.value }))} className="input-campo" />
            </div>
            <div>
              <label className="etiqueta">WhatsApp</label>
              <input value={datos.whatsapp} onChange={e => setDatos(d => ({ ...d, whatsapp: e.target.value }))} className="input-campo" />
            </div>
          </div>
          <div>
            <label className="etiqueta">Horario de atención</label>
            <input value={datos.horario} onChange={e => setDatos(d => ({ ...d, horario: e.target.value }))} className="input-campo" placeholder="Lunes a Sábado: 9:00 AM – 7:00 PM" />
          </div>
          <div>
            <label className="etiqueta">Dirección (opcional)</label>
            <input value={datos.direccion} onChange={e => setDatos(d => ({ ...d, direccion: e.target.value }))} className="input-campo" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-tarjeta p-5 mb-4">
        <div className="flex items-center gap-2 mb-5">
          <Share2 size={18} className="text-marca-marron" />
          <h2 className="font-semibold text-marca-negro">Redes sociales</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="etiqueta">Instagram (URL completo)</label>
            <input value={datos.instagram} onChange={e => setDatos(d => ({ ...d, instagram: e.target.value }))} className="input-campo" placeholder="https://www.instagram.com/..." />
          </div>
          <div>
            <label className="etiqueta">TikTok (URL completo)</label>
            <input value={datos.tiktok} onChange={e => setDatos(d => ({ ...d, tiktok: e.target.value }))} className="input-campo" placeholder="https://www.tiktok.com/@..." />
          </div>
        </div>
      </div>

      <button onClick={guardarConfig} className="btn-primario w-full py-3.5 flex items-center justify-center gap-2 mb-6">
        <Save size={18} />
        Guardar configuración
      </button>

      <div className="bg-white rounded-2xl shadow-tarjeta p-5">
        <div className="flex items-center gap-2 mb-5">
          <Lock size={18} className="text-marca-marron" />
          <h2 className="font-semibold text-marca-negro">Cambiar contraseña</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="etiqueta">Contraseña actual</label>
            <input type="password" value={pass.actual} onChange={e => setPass(p => ({ ...p, actual: e.target.value }))} className="input-campo" />
          </div>
          <div>
            <label className="etiqueta">Nueva contraseña</label>
            <input type="password" value={pass.nueva} onChange={e => setPass(p => ({ ...p, nueva: e.target.value }))} className="input-campo" />
          </div>
          <div>
            <label className="etiqueta">Confirmar contraseña</label>
            <input type="password" value={pass.confirmar} onChange={e => setPass(p => ({ ...p, confirmar: e.target.value }))} className="input-campo" />
          </div>
          <button onClick={cambiarPass} className="btn-outline w-full py-3">
            Cambiar contraseña
          </button>
        </div>
      </div>
    </div>
  )
}
