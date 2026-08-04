import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/hae-portfolio-test/' : '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        hongDaLandscaping: resolve(__dirname, 'hong-da-landscaping.html'),
        swapifly: resolve(__dirname, 'swapifly.html'),
      },
    },
  },
});
