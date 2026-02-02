/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#000',
        text: '#fff',
        'gray-300': '#d1d5db',
        'gray-400': '#9ca3af',
        accent: {
          orange: {
            500: '#f97316',
            600: '#ea580c',
            700: '#c2410c',
          },
        },
        secondary: 'rgba(30, 58, 138, 0.2)', // blue-900/20
      },
      fontFamily: {
        heading: ['Orbitron', 'sans-serif'],
      },
    },
  },
  plugins: [
    plugin(function({ addUtilities }) {
      addUtilities({
        '.text-gradient': {
          'background': 'linear-gradient(45deg, #f97316, #ea580c)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.btn-primary': {
          'background': 'linear-gradient(45deg, #f97316, #ea580c)',
          'color': '#fff',
          'padding': '0.5rem 1rem',
          'border-radius': '0.375rem',
          'font-weight': '600',
          'transition': 'transform 0.2s',
        },
        '.btn-primary:hover': {
          'transform': 'scale(1.05)',
        },
        '.btn-outline': {
          'border': '2px solid #f97316',
          'color': '#f97316',
          'padding': '0.5rem 1rem',
          'border-radius': '0.375rem',
          'font-weight': '600',
          'background': 'transparent',
          'transition': 'all 0.2s',
        },
        '.btn-outline:hover': {
          'background': '#f97316',
          'color': '#fff',
        },
      })
    }),
  ],
}
