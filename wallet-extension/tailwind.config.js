/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./entrypoints/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
   theme: {
    extend: {
      colors: {
        primary: '#443CC7',
        dark: {
          900: '#0A0A0A',
          800: '#1F1F1F',
          700: '#2D2D2D',
          600: '#3D3D3D',
        },
      },
    },
  },
  plugins: [],
}
