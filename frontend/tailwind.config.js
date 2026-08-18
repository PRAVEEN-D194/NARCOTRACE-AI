/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate: {
          850: '#111827',
          900: '#0F172A',
          925: '#0B1120',
          950: '#070C16',
        },
        intel: {
          bg: '#080D1A',
          card: '#0F172A',
          border: '#1E293B',
          accent: '#2563EB',
          cyan: '#06B6D4',
        }
      },
      fontFamily: {
        headline: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }

    },
  },
  plugins: [],
}

