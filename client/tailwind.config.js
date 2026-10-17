/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['"IBM Plex Sans"', 'system-ui', 'Segoe UI', 'sans-serif'] },
      colors: {
        ink: { 950: '#101B24', 900: '#14212B', 800: '#1C2E3B', 700: '#2A4152', 600: '#3D5668' },
        steel: '#5E6E7C',
        paper: '#F3F5F7',
        line: '#DDE3E8',
        signal: { DEFAULT: '#E6A21A', dark: '#A8730A', soft: '#FDF3DC' },
        ok: { DEFAULT: '#2F7D5B', soft: '#E3F2EB' },
        alert: { DEFAULT: '#BF3B2D', soft: '#FBE9E6' },
      },
    },
  },
  plugins: [],
};
