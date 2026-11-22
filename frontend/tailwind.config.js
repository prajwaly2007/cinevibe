/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cine-bg': '#08090D',
        'cine-secondary': '#111319',
        'cine-card': '#191C24',
        'cine-card-hover': '#222631',
        'cine-red': '#E50935',
        'cine-red-hover': '#ff1744',
        'cine-text': '#FFFFFF',
        'cine-muted': '#A1A1AA',
        'cine-border': '#272B38',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(to top, #08090D 0%, rgba(8,9,13,0.85) 45%, rgba(8,9,13,0.2) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
