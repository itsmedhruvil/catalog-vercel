/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
  ],
  theme: { 
    extend: {
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
      }
    } 
  },
  plugins: [],
}
