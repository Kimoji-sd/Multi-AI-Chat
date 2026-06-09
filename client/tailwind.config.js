/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FAFAFA',
        card: '#FFFFFF',
        primary: '#1A1A1A',
        secondary: '#8E8E93',
        accent: '#0066FF',
        divider: '#F0F0F0',
        input: '#F5F5F5',
        skeleton: '#EBEBEB',
        error: '#FF3B30',
        'model-1': '#0066FF',
        'model-2': '#FF6B35',
        'model-3': '#00C781',
        'model-4': '#8B5CF6',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      borderRadius: {
        card: '16px',
        element: '12px',
        pill: '20px',
      },
      maxWidth: {
        mobile: '430px',
      },
      animation: {
        blink: 'blink 1s step-end infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.25s ease-out',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
