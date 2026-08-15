/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0e1a',
        surface: '#141824',
        'surface-light': '#1e2332',
        ink: '#ffffff',
        text: '#ffffff',
        'text-secondary': '#9ca3af',
        primary: '#fa9e0f',
        secondary: '#0346b9',
        accent: '#fa9e0f',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Orbitron', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
      },
      maxWidth: {
        'container': '1200px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cyber-grid': 'linear-gradient(rgba(250, 158, 15, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(250, 158, 15, 0.05) 1px, transparent 1px)',
      },
      boxShadow: {
        'neon': '0 0 5px theme(colors.primary), 0 0 20px theme(colors.primary)',
        'neon-blue': '0 0 5px theme(colors.secondary), 0 0 20px theme(colors.secondary)',
        'cyber': '0 4px 20px rgba(250, 158, 15, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(250, 158, 15, 0.5), 0 0 10px rgba(250, 158, 15, 0.3)' },
          '100%': { boxShadow: '0 0 10px rgba(250, 158, 15, 0.8), 0 0 20px rgba(250, 158, 15, 0.5)' },
        },
      },
    },
  },
  plugins: [],
}
