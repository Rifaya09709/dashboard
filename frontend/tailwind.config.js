/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1E40AF', light: '#3B82F6', dark: '#1E3A8A' },
        accent:  { DEFAULT: '#F97316', light: '#FB923C' },
        success: { DEFAULT: '#10B981' },
        danger:  { DEFAULT: '#EF4444' },
        surface: { DEFAULT: '#F8FAFC', card: '#FFFFFF' }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    }
  },
  plugins: []
};