import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: path.resolve(__dirname, 'src/setupTests.ts'),
    exclude: ['**/@BKP/**', 'node_modules/**', 'dist/**'],
    coverage: {
      provider: 'v8',
    },
  },
  resolve: {
    alias: [
      { find: '@pages', replacement: path.resolve(__dirname, 'src/pages') },
      { find: '@components', replacement: path.resolve(__dirname, 'src/components') },
      { find: '@services', replacement: path.resolve(__dirname, 'src/services') },
      { find: '@design', replacement: path.resolve(__dirname, 'src/design-system') },
      { find: '@utils', replacement: path.resolve(__dirname, 'src/utils') },
      { find: '@contexts', replacement: path.resolve(__dirname, 'src/contexts') },
    ],
  },
})
