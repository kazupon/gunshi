import viteTsconfigPaths from 'vite-tsconfig-paths'
import { defaultExclude, defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [viteTsconfigPaths()],
  test: {
    globals: true,
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
