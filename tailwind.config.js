/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Fredoka', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        carissma: {
          50: '#FEF6F8', 100: '#FDEBF0', 200: '#FCD9E3', 300: '#FABED0', 400: '#F794B5',
          500: '#F5639A', 600: '#DE317C', 700: '#B32561', 800: '#901C4C', 900: '#78153E', 950: '#480923',
        },
        saffron: {
          50: '#FEF8EA', 100: '#FEF0D0', 200: '#FDE3A4', 300: '#FBD05F', 400: '#EFBE35',
          500: '#DBAB2F', 600: '#BA8B25', 700: '#95651A', 800: '#764B11', 900: '#613B0C', 950: '#372204',
        },
        carnation: {
          50: '#FEF5F4', 100: '#FDEAE8', 200: '#FBD6D2', 300: '#F9B9B3', 400: '#FD938B',
          500: '#F45F5A', 600: '#DF3033', 700: '#B52525', 800: '#941D1B', 900: '#7C1615', 950: '#4B0909',
        },
        espresso: {
          50: '#FDF6F4', 100: '#FBECE8', 200: '#F7D9D2', 300: '#F1BEB2', 400: '#F19885',
          500: '#E4674E', 600: '#BE4E38', 700: '#953D2A', 800: '#732E1E', 900: '#5A2316', 950: '#331109',
        },
        linen: {
          50: '#F8F2EC', 100: '#F3E8DE', 200: '#ECDAC9', 300: '#E2C6AC', 400: '#D5A983',
          500: '#AF8668', 600: '#8E6952', 700: '#72523F', 800: '#573D2F', 900: '#453024', 950: '#261A12',
        },
        brand: { DEFAULT: '#DE317C', light: '#F5639A', dark: '#B32561' },
      },
    },
  },
  plugins: [],
};
