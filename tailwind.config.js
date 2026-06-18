/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        marca: {
          negro: '#1C1C1C',
          blanco: '#FFFFFF',
          marron: '#9B7B5B',
          'marron-oscuro': '#7A5C3A',
          'marron-claro': '#B89070',
          beige: '#F5EFE0',
          'beige-borde': '#E8D8C0',
          'beige-suave': '#FAF8F5',
          fondo: '#FAFAF8',
          texto: '#1C1C1C',
          'texto-suave': '#7A6B5E',
          dorado: '#C9A96E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Georgia', 'Times New Roman', 'serif'],
      },
      boxShadow: {
        'tarjeta': '0 2px 12px rgba(155, 123, 91, 0.10)',
        'tarjeta-hover': '0 8px 28px rgba(155, 123, 91, 0.20)',
        'barra': '0 -2px 20px rgba(28, 28, 28, 0.08)',
        'modal': '0 20px 60px rgba(28, 28, 28, 0.20)',
        'flotante': '0 8px 32px rgba(28, 28, 28, 0.13), 0 2px 8px rgba(28, 28, 28, 0.06)',
        'banner': '0 4px 24px rgba(28, 28, 28, 0.12)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'bounce-in': 'bounceIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        bounceIn: {
          from: { transform: 'scale(0.8)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
