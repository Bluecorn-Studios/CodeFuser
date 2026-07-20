import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'defer-css',
        transformIndexHtml(html) {
          return html.replace(
            /<link\s+rel="stylesheet"\s+([^>]*?)href="([^"]+)"([^>]*?)>/g,
            '<link rel="preload" href="$2" as="style" onload="this.onload=null;this.rel=\'stylesheet\'" $1 $3><noscript><link rel="stylesheet" href="$2" $1 $3></noscript>'
          );
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('scheduler') || id.includes('react-dom')) {
                return 'vendor-react';
              }
              if (id.includes('supabase') || id.includes('websocket')) {
                return 'vendor-supabase';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-lucide';
              }
              if (id.includes('motion') || id.includes('framer-motion')) {
                return 'vendor-motion';
              }
              if (id.includes('recharts') || id.includes('d3')) {
                return 'vendor-recharts';
              }
              return 'vendor';
            }
          }
        }
      }
    }
  };
});
