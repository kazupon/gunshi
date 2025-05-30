import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['./packages/gunshi/src/**/*.test.ts'],
    typecheck: {
      tsconfig: './tsconfig.ci.json'
    }
  }
})
