import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/hae-portfolio-test/' : '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        gogoRentals: resolve(__dirname, 'gogo-rentals.html'),
      },
    },
  },
});
