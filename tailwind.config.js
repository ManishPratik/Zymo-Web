/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {

      colors: {
        appColor: "#edff8d", // Define appColor
        darkGrey: "#212121", // Corresponds to Colors.grey[900]
        darkGrey2: "#424242", // Corresponds to Colors.grey[800]
        black: "#000000",    // Black color
        white: "#ffffff",    // White color
        
      },

    },
  },
  plugins: [],
}