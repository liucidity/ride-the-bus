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
      colors: {
        my_color: '#4dcb7a',
        grey: '#1f2937',
        dark_slate: '#0f172a'
      },
    },
  },
  plugins: [],
}
