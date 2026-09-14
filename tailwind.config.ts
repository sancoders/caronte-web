import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}', './componentes/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        fondo: '#0b0a12',
        panel: '#141221',
        borde: '#252239',
        acento: '#8b5cf6',
        acentoSuave: '#a78bfa',
        tenue: '#8e89a8',
      },
    },
  },
  plugins: [],
} satisfies Config
