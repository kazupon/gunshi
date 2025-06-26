import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['./packages/gunshi/src/**/*.test.ts', './packages/plugin-**/src/**/*.test.ts'],
    typecheck: {
      tsconfig: './tsconfig.ci.json'
    },
    coverage: {
      include: ['packages/gunshi/src/**/*.ts', 'packages/plugin-**/src/**/*.ts']
    }
  }
})
