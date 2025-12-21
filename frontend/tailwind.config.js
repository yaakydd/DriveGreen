export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'lum-base': '#020617', // Slate 950 (Deepest night)
        'lum-deep': '#0f172a', // Slate 900
        'lum-accent': '#34d399', // Emerald 400 (Bioluminescence)
        'lum-highlight': '#5eead4', // Teal 300
        'lum-text-light': '#f8fafc', // Slate 50
        'lum-text-dim': '#cbd5e1', // Slate 300
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'aurora-gradient': 'linear-gradient(to top right, #0f172a, #022c22)',
      }
    }
  },
  plugins: [],
}
