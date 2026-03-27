// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // --- Updated Tailwind Configuration Directly in Vite ---
    tailwindcss({
      config: {
        content: [
          "./index.html",
          "./src/**/*.{js,ts,jsx,tsx}",
        ],
        theme: {
          extend: {
            colors: {
              // Core brand colors
              brand: {
                light: '#B8EBC8', // very light green
                DEFAULT: '#22c55e', // main green (unchanged)
                dark: '#166534', // deep green for accents
              },
              sidebar: '#f8fafc', // extremely light blue-gray
            },
            backgroundImage: {
              // --- Define Texture Paths Directly ---
              // *This requires pattern files in your public/patterns/ folder.*
              'pattern-ceramic': "url('/patterns/white-ceramic.png')",
              'pattern-steel': "url('/patterns/brushed-steel.png')",
              'pattern-wood': "url('/patterns/light-wood.png')",
              'pattern-marble': "url('/patterns/light-marble.png')",
            },
            borderRadius: {
              '4xl': '2rem', // for large dashboard cards
            },
            boxShadow: {
              'tactile': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)', // soft, deep shadow
            }
          },
        },
        plugins: [],
      }
    }),
  ],
})