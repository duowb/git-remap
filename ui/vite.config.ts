import vue from '@vitejs/plugin-vue';
import UnoCSS from 'unocss/vite';

import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), UnoCSS()],
  server: {
    proxy: {
      '/api': {
        target: 'http://10.27.10.84:7777',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: '../dist/ui'
  }
});
