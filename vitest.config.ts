import { defaultExclude, defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    tsconfigPaths: true
  },
  test: {
    globals: true,
    testTimeout: 60_000,
    include: ['**/*.test.?(c|m)[jt]s?(x)'],
    exclude: [...defaultExclude, './packages/docs/src/**/*.test.ts', './playground/**/*.test.ts'],
    typecheck: {
      tsconfig: './tsconfig.ci.json'
    },
    coverage: {
      include: [
        'packages/gunshi/src/**/*.ts',
        'packages/plugin/src/**/*.ts',
        'packages/shared/src/**/*.ts',
        'packages/resources/src/**/*.ts',
        'packages/plugin-**/src/**/*.ts'
      ]
    }
  }
})
