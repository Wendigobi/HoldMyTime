import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fff9e6',
          100: '#fff1bf',
          200: '#ffe780',
          300: '#ffd94d',
          400: '#f5c542', // main
          500: '#d4af37',
          600: '#b7942f',
          700: '#8a7224',
          800: '#5f5119',
          900: '#3a310f'
        }
      },
      boxShadow: {
        'gold': '0 8px 30px rgba(212,175,55,0.25)'
      },
      backgroundImage: {
        'gold-grid':
          'linear-gradient(rgba(212,175,55,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.08) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      }
    },
  },
  plugins: [],
}
export default config
