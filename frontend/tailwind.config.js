/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5B4FE0',
          50: '#F4F3FF',
          100: '#E9E6FE',
          200: '#D5D0FD',
          300: '#B4AAFA',
          400: '#8C7DF6',
          500: '#5B4FE0',
          600: '#4F3CD6',
          700: '#432FB8',
          800: '#382895',
          900: '#2F2378',
        },
        sidebar: {
          DEFAULT: '#0F1629',
          hover: '#19223C',
          active: '#5B4FE0',
          border: '#1E293B',
          text: '#94A3B8',
          textActive: '#FFFFFF',
        },
        surface: {
          DEFAULT: '#F5F6FA',
          card: '#FFFFFF',
          border: '#E2E8F0',
        },
        status: {
          interested: '#22C55E',
          notInterested: '#EF4444',
          contacted: '#3B82F6',
          new: '#64748B',
          inProgress: '#3B82F6',
          designing: '#8B5CF6',
          quotation: '#F59E0B',
          completed: '#22C55E',
          onHold: '#F97316',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 10px 0 rgba(15, 22, 41, 0.04), 0 1px 3px 0 rgba(15, 22, 41, 0.02)',
        'card-hover': '0 10px 25px -5px rgba(15, 22, 41, 0.08), 0 8px 10px -6px rgba(15, 22, 41, 0.04)',
        sidebar: '4px 0 24px 0 rgba(15, 22, 41, 0.06)',
        dropdown: '0 10px 38px -10px rgba(22, 23, 24, 0.35), 0 10px 20px -15px rgba(22, 23, 24, 0.2)',
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px',
      }
    },
  },
  plugins: [],
}
