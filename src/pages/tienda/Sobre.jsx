import { Instagram, ExternalLink, MessageCircle, Mail, Clock, MapPin } from 'lucide-react'
import { useConfig } from '../../store/useConfig'
import { abrirWhatsApp } from '../../utils/whatsapp'

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
    </svg>
  )
}

export default function Sobre() {
  const config = useConfig(s => s.config)

  return (
    <div className="contenedor py-5 max-w-lg mx-auto animate-fade-in">
      <div className="text-center mb-8">
        {config.logo ? (
          <img src={config.logo} alt={config.nombre} className="w-20 h-20 mx-auto rounded-2xl object-contain mb-4" />
        ) : (
          <div className="w-20 h-20 bg-marca-marron rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl font-display">YF</span>
          </div>
        )}
        <h1 className="font-display font-bold text-2xl text-marca-negro">{config.nombre}</h1>
        {config.descripcion && (
          <p className="text-sm text-marca-texto-suave mt-3 leading-relaxed">{config.descripcion}</p>
        )}
      </div>

      <div className="space-y-3 mb-6">
        <button
          onClick={() => abrirWhatsApp(config.whatsapp, '¡Hola! Quisiera obtener información sobre sus productos.')}
          className="w-full flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl hover:bg-green-100 active:scale-95 transition-all"
        >
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
            <MessageCircle size={20} fill="white" strokeWidth={0} className="text-white" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-green-800 text-sm">WhatsApp</p>
            <p className="text-green-600 text-xs">{config.whatsapp}</p>
          </div>
          <ExternalLink size={16} className="text-green-500 ml-auto" />
        </button>

        {config.instagram && (
          <a
            href={config.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 p-4 bg-pink-50 border border-pink-100 rounded-2xl hover:bg-pink-100 active:scale-95 transition-all"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Instagram size={20} className="text-white" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-pink-800 text-sm">Instagram</p>
              <p className="text-pink-500 text-xs">@yeral.fancy</p>
            </div>
            <ExternalLink size={16} className="text-pink-400 ml-auto" />
          </a>
        )}

        {config.tiktok && (
          <a
            href={config.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-2xl hover:bg-gray-100 active:scale-95 transition-all"
          >
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <TikTokIcon />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-marca-negro text-sm">TikTok</p>
              <p className="text-marca-texto-suave text-xs">@yeralfancy</p>
            </div>
            <ExternalLink size={16} className="text-marca-texto-suave ml-auto" />
          </a>
        )}

        {config.email && (
          <a
            href={`mailto:${config.email}`}
            className="w-full flex items-center gap-3 p-4 bg-marca-beige border border-marca-beige-borde rounded-2xl hover:bg-marca-beige-borde active:scale-95 transition-all"
          >
            <div className="w-10 h-10 bg-marca-marron rounded-xl flex items-center justify-center">
              <Mail size={18} className="text-white" />
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-marca-negro text-sm">Email</p>
              <p className="text-marca-texto-suave text-xs truncate">{config.email}</p>
            </div>
          </a>
        )}

        {config.horario && (
          <div className="w-full flex items-center gap-3 p-4 bg-marca-beige border border-marca-beige-borde rounded-2xl">
            <div className="w-10 h-10 bg-marca-marron rounded-xl flex items-center justify-center">
              <Clock size={18} className="text-white" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-marca-negro text-sm">Horario</p>
              <p className="text-marca-texto-suave text-xs">{config.horario}</p>
            </div>
          </div>
        )}

        {config.direccion && (
          <div className="w-full flex items-center gap-3 p-4 bg-marca-beige border border-marca-beige-borde rounded-2xl">
            <div className="w-10 h-10 bg-marca-marron rounded-xl flex items-center justify-center">
              <MapPin size={18} className="text-white" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-marca-negro text-sm">Dirección</p>
              <p className="text-marca-texto-suave text-xs">{config.direccion}</p>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-marca-texto-suave">© 2024 {config.nombre}. Todos los derechos reservados.</p>
    </div>
  )
}
