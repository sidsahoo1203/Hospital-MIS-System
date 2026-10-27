/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'header-bg': "url('/header-img.png')"
      },
      screens: {
        'sm': '320px',
        'md': '668px', 
        'lg': '1024px', 
      },
    },
  },
  plugins: [],
  
}

