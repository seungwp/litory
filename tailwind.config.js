/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Noto Serif KR"', 'serif'],
      },
      colors: {
        ink: {
          50: '#f6f6f4',
          100: '#e9e8e2',
          800: '#292524',
          900: '#1c1917',
          950: '#0f0d0c',
        },
        hanji: '#f5f1e8',
        celadon: '#7ba894',
        dancheong: '#00d4a4',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'tori-bob': {
          '0%, 100%': { transform: 'translateY(0) rotate(-4deg)' },
          '50%': { transform: 'translateY(-3px) rotate(5deg)' },
        },
        'tori-jump': {
          '0%': { transform: 'translateY(0) rotate(0deg)' },
          '30%': { transform: 'translateY(-9px) rotate(-10deg) scale(1.08)' },
          '60%': { transform: 'translateY(0) rotate(8deg)' },
          '80%': { transform: 'translateY(-3px) rotate(-4deg)' },
          '100%': { transform: 'translateY(0) rotate(0deg)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'scale-in': 'scale-in 0.2s ease-out both',
        'tori-bob': 'tori-bob 2.6s ease-in-out infinite',
        'tori-jump': 'tori-jump 0.7s ease-in-out',
      },
    },
  },
  plugins: [],
}
