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
      keyframes: {
        ping: {
          '0%, 25%': {
            transform: 'scale(0.7)',
            opacity: '1'
          },
          '50%,100%': { transform: 'scale(0.5)', opacity: '0.7' }
        }
      },
      animation: {
        ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite'
      },
      colors: {
        my_color: '#4dcb7a',
        grey: '#1f2937',
        dark_slate: '#0f172a'
      },
    },
  },
  plugins: [],
}
