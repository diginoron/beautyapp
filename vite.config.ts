
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Correctly accesses the environment variable from Node.js process.env during build.
    // This variable is then used to define 'process.env.API_KEY' for client-side code.
    'process.env.API_KEY': JSON.stringify(process.env.VITE_API_KEY),
  },
});
