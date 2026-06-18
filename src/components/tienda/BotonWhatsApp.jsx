import { MessageCircle } from 'lucide-react'
import { useConfig } from '../../store/useConfig'
import { abrirWhatsApp } from '../../utils/whatsapp'

export function BotonWhatsApp() {
  const whatsapp = useConfig(s => s.config.whatsapp)

  return (
    <button
      onClick={() => abrirWhatsApp(whatsapp, '¡Hola! Me gustaría obtener más información sobre sus productos.')}
      className="fixed bottom-20 right-4 z-30 w-13 h-13 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 active:scale-90 transition-all duration-200"
      style={{ width: 52, height: 52 }}
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle size={24} fill="white" strokeWidth={0} />
    </button>
  )
}
