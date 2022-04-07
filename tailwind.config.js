module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        // < 300px, very small phones, Galaxy fold

        'xxsm': '300px', // small phones
        // => @media (min-width: 640px) { ... }

        'xsm': '400px', // large phones
        // => @media (min-width: 640px) { ... }
  
        'sm': '640px', // small tablet
        // => @media (min-width: 640px) { ... }
  
        'md': '768px', // large tablet
        // => @media (min-width: 768px) { ... }
  
        'lg': '1024px',
        // => @media (min-width: 1024px) { ... }
  
        'xl': '1280px',
        // => @media (min-width: 1280px) { ... }
  
        '2xl': '1536px',
        // => @media (min-width: 1536px) { ... }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/line-clamp')
  ],
}
