/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Archiva warm palette — all tokens in one place
        warm: {
          bg:      '#FDF6EE',
          border:  '#D4A87A',
          accent:  '#B85C1A',
          'accent-hover': '#9A4A12',
          pale:    '#FAEADC',
          tag:     '#E8C99A',
          'tag-text': '#5C2E00',
          stat:    '#F0E0CC',
          hover:   '#EDD5B5',
        },
        ink: {
          primary:   '#1A0F00',
          secondary: '#5C3D1E',
          muted:     '#8A6040',
        }
      },
      fontFamily: {
        // Lora for warmth + readability; system sans as fallback
        serif: ['Lora', 'Georgia', 'serif'],
        sans:  ['DM Sans', 'system-ui', 'sans-serif'],
      },
      borderWidth: { DEFAULT: '1px', '1.5': '1.5px' },
    }
  },
  plugins: []
}