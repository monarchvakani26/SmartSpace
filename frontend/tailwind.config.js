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
          DEFAULT: '#2C4A3E',
          50: '#EFF4F1',
          100: '#D8E5DD',
          200: '#B4CBBE',
          300: '#7FA392',
          400: '#4F7A66',
          500: '#2C4A3E',
          600: '#243D33',
          700: '#1C3028',
          800: '#15241E',
          900: '#0F1A16',
        },
        brass: {
          DEFAULT: '#A67C52',
          soft: '#E8D5C0',
        },
        ink: {
          DEFAULT: '#1A1814',
          muted: '#5C574E',
        },
        plaster: '#E2E0D8',
        floor: '#C9B8A0',
        sidebar: {
          DEFAULT: '#1F1C19',
          hover: '#2A2622',
          active: '#2C4A3E',
          border: '#2E2A26',
          text: '#A8A498',
          textActive: '#F7F6F2',
        },
        surface: {
          DEFAULT: '#D9DDD6',
          card: '#F7F6F2',
          border: '#C8C5BB',
        },
        status: {
          interested: '#2C4A3E',
          notInterested: '#9B3B2E',
          contacted: '#3D5A80',
          new: '#5C574E',
          inProgress: '#3D5A80',
          designing: '#2C4A3E',
          quotation: '#A67C52',
          completed: '#2C4A3E',
          onHold: '#9B6B2E',
        }
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        display: ['Instrument Serif', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 0 rgba(26, 24, 20, 0.04)',
        'card-hover': '0 12px 40px -16px rgba(26, 24, 20, 0.18)',
        sidebar: '4px 0 32px rgba(26, 24, 20, 0.12)',
        dropdown: '0 10px 38px -10px rgba(26, 24, 20, 0.28)',
      },
      borderRadius: {
        xl: '4px',
        '2xl': '6px',
        '3xl': '8px',
      }
    },
  },
  plugins: [],
}
