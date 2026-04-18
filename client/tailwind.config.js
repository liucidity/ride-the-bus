/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1440px',
    },
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        felt: {
          DEFAULT: '#0e2518',
          dark: '#060f09',
          light: '#152e1f',
          mid: '#0a1c11',
        },
        gold: {
          DEFAULT: '#e8b84b',
          dim: '#a87d28',
          bright: '#f5cc6a',
          muted: 'rgba(232, 184, 75, 0.15)',
        },
        green: {
          game: '#2dba6e',
          dim: '#1e8a4e',
          muted: 'rgba(45, 186, 110, 0.15)',
        },
        suit: {
          red: '#e0403a',
        },
        // legacy compat
        my_color: '#2dba6e',
        grey: '#1f2937',
        dark_slate: '#0f172a',
      },
      keyframes: {
        'float-up': {
          '0%':   { transform: 'translateY(0) rotate(0deg)',   opacity: '1' },
          '100%': { transform: 'translateY(-110vh) rotate(15deg)', opacity: '0' },
        },
        'slide-up': {
          '0%':   { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%':   { transform: 'scale(0.92)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(45, 186, 110, 0.25)' },
          '50%':      { boxShadow: '0 0 40px rgba(45, 186, 110, 0.55)' },
        },
        'gold-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(232, 184, 75, 0.25)' },
          '50%':      { boxShadow: '0 0 40px rgba(232, 184, 75, 0.55)' },
        },
        ping: {
          '0%, 25%':  { transform: 'scale(0.7)', opacity: '1' },
          '50%, 100%':{ transform: 'scale(0.5)', opacity: '0.7' },
        },
        'timer-danger': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':      { transform: 'scale(1.15)' },
        },
      },
      animation: {
        'float-up':    'float-up linear infinite',
        'slide-up':    'slide-up 0.45s ease-out both',
        'fade-in':     'fade-in 0.5s ease-out both',
        'scale-in':    'scale-in 0.4s ease-out both',
        'glow-pulse':  'glow-pulse 2.5s ease-in-out infinite',
        'gold-pulse':  'gold-pulse 2.5s ease-in-out infinite',
        ping:          'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        'timer-danger':'timer-danger 0.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
