/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {

      colors: {
        appColor: "#faffa4", // Define appColor
        darkGrey: "#212121", // Corresponds to Colors.grey[900]
        darkGrey2: "#424242", // Corresponds to Colors.grey[800]
        black: "#000000",    // Black color
        white: "#ffffff",    // White color
      },
      fontFamily: {
        merriweather: ['"Merriweather"', 'serif'],
      },

      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        arrowLoop: {
          '0%': { transform: 'translateX(0)', opacity: 1 },
          '40%': { transform: 'translateX(100%)', opacity: 0 },
          '41%': { transform: 'translateX(-100%)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
      },
      animation: {
        'slide-up': 'slideUp 1s ease-out forwards',
        'slide-up-delayed': 'slideUp 1s ease-out 0.5s forwards',
        'arrow-loop': 'arrowLoop 0.8s ease-in-out',
      }
    },
  },
  plugins: [],
}