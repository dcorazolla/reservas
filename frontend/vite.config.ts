import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@pages', replacement: path.resolve(__dirname, 'src/pages') },
      { find: '@components', replacement: path.resolve(__dirname, 'src/components') },
      { find: '@services', replacement: path.resolve(__dirname, 'src/services') },
      { find: '@design', replacement: path.resolve(__dirname, 'src/design-system') },
      { find: '@utils', replacement: path.resolve(__dirname, 'src/utils') },
      { find: '@contexts', replacement: path.resolve(__dirname, 'src/contexts') },
      { find: '@models', replacement: path.resolve(__dirname, 'src/models') },
    ],
  },
  server: {
    // Run Vite as a normal dev server (not middleware mode) so the CLI
    // starts an HTTP server. Middleware mode is used when embedding Vite
    // into another server and causes the CLI to error with
    // "HTTP server not available" when started directly.
    middlewareMode: false,
    // Use a non-default port to avoid collisions with lingering processes
    // on machines where 5173 may already be used.
    port: 5173,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
  },
  build: {
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@chakra-ui/react', 'react-icons'],
        },
      },
    },
  },
})
