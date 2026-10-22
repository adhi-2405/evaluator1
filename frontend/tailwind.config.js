/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0B1120',
          800: '#111827',
          700: '#1F2937',
        },
        brand: {
          lumilearn: '#8B5CF6', // Purple/Violet - Debug & Brain
          learnmorph: '#06B6D4', // Cyan - Transform & Multimodal
          conceptverse: '#10B981', // Emerald - Interactive Experiment
          accent: '#6366F1', // Indigo primary
        }
      }
    },
  },
  plugins: [],
}
