/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        serif: ['"Newsreader"', '"Merriweather"', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        brand: {
          50: '#F0F5FF',
          100: '#E5EDFF',
          200: '#CDDCFF',
          300: '#A4BFFF',
          400: '#7198FE',
          500: '#3B6CFA',
          600: '#1D45F0',
          700: '#1230DB',
          800: '#0E24B0',
          900: '#0A1A88',
          950: '#050D4D',
        },
        executive: {
          navy: '#0C1E3C',
          dark: '#0A0E1A',
          charcoal: '#171C26',
          border: '#E2E8F0',
          paper: '#FFFFFF',
          parchment: '#FAF9F6',
          muted: '#64748B',
        },
      },
      boxShadow: {
        'paper': '0 4px 20px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        'paper-lg': '0 20px 30px -10px rgba(15, 23, 42, 0.12), 0 8px 12px -4px rgba(15, 23, 42, 0.06)',
      }
    },
  },
  plugins: [],
};
