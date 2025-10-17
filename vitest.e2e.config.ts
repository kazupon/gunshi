import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['playground/**/*.test.ts', 'e2e/**.spec.ts']
  }
})
