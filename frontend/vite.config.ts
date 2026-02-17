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
})
