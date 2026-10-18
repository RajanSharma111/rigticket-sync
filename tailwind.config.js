import containerQueries from '@tailwindcss/container-queries'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        rig: {
          bg: '#0b1120',
          panel: '#111c30',
          card: '#16233b',
          border: '#24344f',
          amber: '#f59e0b',
          emerald: '#10b981',
        },
      },
      keyframes: {
        'sync-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(120%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'pop-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        'sync-pulse': 'sync-pulse 1s ease-in-out infinite',
        'slide-in': 'slide-in 0.35s ease-out',
        'pop-in': 'pop-in 0.25s ease-out',
      },
    },
  },
  plugins: [containerQueries],
}
