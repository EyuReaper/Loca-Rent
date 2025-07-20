import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


export default defineConfig({

   content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3498DB', //  primary blue
        secondary: '#2ECC71', //secondary green
        accent: '#FFA000', //  accent orange
        darkText: '#2C3E50', // Dark text color
        lightBg: '#ECF0F1', // Light background color
      },
    },
  },
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
});