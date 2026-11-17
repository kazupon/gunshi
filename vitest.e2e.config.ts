import { defineConfig } from 'vite-plus'

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 60_000,
    include: ['**/*.spec.?(c|m)[jt]s?(x)']
  }
})
