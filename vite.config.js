import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import postcssPxToViewport from 'postcss-px-to-viewport';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve('./src'),
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          'primary-color': '#1890ff',
        },
      },
    },
    postcss: {
      plugins: [
        postcssPxToViewport({
          viewportWidth: 375,
          unitPrecision: 5,
          include: /src\/.*\.(css|less|scss)$/,
          selectorBlackList: ['ant-', 'ignore-'],
          propList: ['*'],
          viewportUnit: 'vw',
          minPixelValue: 1,
          mediaQuery: false,
        }),
      ],
    },
  },
  server: {
    port: 3000,
    open: true,
    cors: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
  },
});