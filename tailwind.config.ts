import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Theme tokens (driven by CSS variables in globals.css)
        bg: 'var(--bg)',
        card: 'var(--card)',
        'card-2': 'var(--card-2)',
        panel: 'var(--panel)',
        fg: 'var(--fg)',
        'fg-2': 'var(--fg-2)',
        'fg-3': 'var(--fg-3)',
        line: 'var(--line)',
        fill: 'var(--fill)',
        'fill-2': 'var(--fill-2)',
        accent: '#e63946',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'var(--font-cairo)', 'Inter', 'system-ui', 'sans-serif'],
        bebas: ['var(--font-bebas)', 'var(--font-cairo)', 'Bebas Neue', 'sans-serif'],
        cairo: ['var(--font-cairo)', 'sans-serif'],
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease forwards',
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
};

export default config;
