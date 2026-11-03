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
          // Keep the boot payload small: `firebase/app` + `firebase/auth` are
          // the only Firebase pieces on the critical path. Firestore, storage,
          // functions and app-check are dynamically imported, so each gets its
          // own chunk and is only fetched when a screen actually needs it.
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (id.includes('@firebase/auth') || id.includes('firebase/auth')) return 'firebase-auth';
            if (
              id.includes('@firebase/firestore') ||
              id.includes('firebase/firestore') ||
              id.includes('@firebase/webchannel-wrapper')
            ) return 'firebase-firestore';
            if (id.includes('@firebase/storage') || id.includes('firebase/storage')) return 'firebase-storage';
            if (id.includes('@firebase/functions') || id.includes('firebase/functions')) return 'firebase-functions';
            if (id.includes('@firebase/app-check') || id.includes('firebase/app-check')) return 'firebase-app-check';
            if (id.includes('@firebase/') || id.includes('node_modules/firebase/')) return 'firebase-core';
            if (id.includes('recharts')) return 'charts';
            if (id.includes('framer-motion') || id.includes('/node_modules/motion')) return 'motion';
            if (id.includes('react-markdown') || id.includes('remark') || id.includes('micromark') || id.includes('mdast') || id.includes('hast')) return 'markdown';
            if (id.includes('react-router') || id.includes('react-dom') || id.includes('/node_modules/react/') || id.includes('/node_modules/scheduler/')) return 'vendor';
          },
        },
      },
    },
  };
});
