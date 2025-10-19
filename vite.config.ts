import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Enable code splitting and chunk optimization
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunk for React and core dependencies
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('jspdf')) {
              return 'vendor-pdf';
            }
            if (id.includes('marked')) {
              return 'vendor-markdown';
            }
            // Other vendor dependencies
            return 'vendor-other';
          }

          // Application chunks
          if (id.includes('src/components/steps/')) {
            return 'steps';
          }
          if (id.includes('src/templates/')) {
            return 'templates';
          }
          if (id.includes('src/utils/')) {
            return 'utils';
          }
        },
        // Optimize chunk file names
        chunkFileNames: `js/[name]-[hash].js`,
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name!.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `img/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
    // Enable compression and minification
    minify: 'terser',
    // Optimize chunk size
    chunkSizeWarningLimit: 500, // Stricter limit for better performance
    // Enable source maps for debugging (disable in production)
    sourcemap: process.env.NODE_ENV === 'development',
    // Optimize CSS
    cssCodeSplit: true,
    // Enable asset inlining for small files
    assetsInlineLimit: 4096,
  },
  // Enable tree shaking
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['jspdf', 'marked'], // These will be loaded dynamically
  },
  // Enable compression in preview mode
  preview: {
    headers: {
      'Cache-Control': 'public, max-age=31536000',
    },
  },
})
