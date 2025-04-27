import vue from '@vitejs/plugin-vue';
import UnoCSS from 'unocss/vite';
import { defineConfig } from 'vite';

import mkcert from 'vite-plugin-mkcert';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), UnoCSS(), mkcert()],
  server: {
    // @ts-ignore
    https: true,
    proxy: {
      '/api': {
        target: 'http://10.27.10.84:7777',
        changeOrigin: true
      }
    }
  }
});
