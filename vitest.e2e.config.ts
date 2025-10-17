import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['**/*.spec.?(c|m)[jt]s?(x)']
  }
})
