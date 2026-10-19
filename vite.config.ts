import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {loadEnv, defineConfig} from 'vite';

export default defineConfig(({command, mode}) => {
  // Guard: never build a deployable bundle without Firebase config. An env-less
  // build produces `apiKey: undefined` in the bundle -> auth/invalid-api-key at
  // runtime -> blank site (this happened once via a manual deploy without .env).
  // CI provides VITE_FIREBASE_* via GitHub Actions secrets; local builds need .env.
  if (command === 'build') {
    const env = loadEnv(mode, process.cwd(), 'VITE_');
    if (!env.VITE_FIREBASE_API_KEY) {
      throw new Error(
        '[T4C] Refusing to build: VITE_FIREBASE_API_KEY is missing. ' +
          'Deploy via GitHub Actions (which injects the secrets), or create a local .env with the VITE_FIREBASE_* values first.'
      );
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      // Keep large vendor libs in their own chunks so legal/marketing routes
      // stay light; images are remote (Cloudinary) — prefer modern formats
      // (auto f_auto,q_auto) and lazy-load below the fold in components.
      chunkSizeWarningLimit: 900,
      sourcemap: false,
      cssCodeSplit: true,
      assetsInlineLimit: 4096,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage', 'firebase/functions', 'firebase/app-check'],
            charts: ['recharts'],
            motion: ['framer-motion', 'motion'],
            markdown: ['react-markdown'],
          },
        },
      },
    },
  };
});
