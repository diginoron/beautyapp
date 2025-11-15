
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // FIX: Cast import.meta to any to resolve TypeScript error 'Property 'env' does not exist on type 'ImportMeta'.'
    // This workaround is applied because adding a new global type declaration file (e.g., vite-env.d.ts) is not permitted.
    'process.env.API_KEY': JSON.stringify((import.meta as any).env.VITE_API_KEY),
  },
});