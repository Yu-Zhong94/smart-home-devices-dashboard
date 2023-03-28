const { escapeJavaScript } = require('joi-browser')
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  mode: 'jit',
  content: ['./views/**/*.{html,js}'],
  // content: ["./views/**/*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        clifford: '#da373d',
      }
    },
  },
  plugins: [],
}
