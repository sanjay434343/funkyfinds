/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        }
      },
      animation: {
        slideDown: 'slideDown 0.2s ease-out',
        },
      backdropFilter: {
        'none': 'none',
        'blur': 'blur(8px)',
      },
      fontFamily: {
        funky: ['FunkyStar', 'sans-serif']
      }
    },
  },
  plugins: [],
};
