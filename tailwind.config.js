/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        abyss: '#060816',
        cyber: '#00f5d4',
        pulse: '#ff4fd8',
        shock: '#7c5cff',
        ember: '#ff9f1c',
      },
      boxShadow: {
        neon: '0 0 30px rgba(0, 245, 212, 0.18)',
        pulse: '0 0 35px rgba(255, 79, 216, 0.18)',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        grid: 'radial-gradient(circle at center, rgba(255,255,255,0.06) 1px, transparent 1px)',
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        pulseGlow: 'pulseGlow 3s ease-in-out infinite',
        slideUp: 'slideUp 0.7s ease-out both',
        'radar-spin': 'radar-spin 12s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(0, 245, 212, 0.12)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 245, 212, 0.25)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'radar-spin': {
          from: { transform: 'translate(-50%, -50%) rotate(0deg)' },
          to: { transform: 'translate(-50%, -50%) rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
};
