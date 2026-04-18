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
        },
        gold: {
          DEFAULT: '#e8b84b',
          dim: '#a87d28',
          bright: '#f5cc6a',
        },
        green: {
          game: '#2dba6e',
          dim: '#1e8a4e',
        },
        suit: {
          red: '#e0403a',
        },
        my_color: '#2dba6e',
        grey: '#1f2937',
        dark_slate: '#0f172a',
      },
      keyframes: {
        'slide-up': {
          '0%':   { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%':   { transform: 'scale(0.93)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        'press': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':      { transform: 'scale(0.94)' },
        },
        ping: {
          '0%, 25%':   { transform: 'scale(0.7)', opacity: '1' },
          '50%, 100%': { transform: 'scale(0.5)', opacity: '0.7' },
        },
      },
      animation: {
        'slide-up':  'slide-up 0.45s ease-out both',
        'fade-in':   'fade-in 0.5s ease-out both',
        'scale-in':  'scale-in 0.4s ease-out both',
        press:       'press 0.25s ease-in-out',
        ping:        'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
}
