import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: '/' // Open home page by default
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
            input: {
                main: './index.html',
                resume: './resume.html',
                connect: './connect.html',
                footage: './footage.html'
            }
    }
  }
});

