import {
  comments,
  defineConfig,
  imports,
  javascript,
  jsonc,
  markdown,
  prettier,
  promise,
  regexp,
  stylistic,
  typescript,
  unicorn,
  vitest,
  vue,
  yaml
} from '@kazupon/eslint-config'
import { globalIgnores } from 'eslint/config'

const config: ReturnType<typeof defineConfig> = defineConfig(
  javascript(),
  stylistic(),
  comments({
    kazupon: {
      ignores: ['./playground/**', './docs/**', './test/**', './src/**.test.ts']
    }
  }),
  imports({
    typescript: true,
    rules: {
      'import/extensions': ['error', 'always', { ignorePackages: true }]
    }
  }),
  promise(),
  regexp(),
  unicorn({
    rules: {
      'unicorn/no-array-push-push': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/no-null': 'off'
    }
  }),
  typescript({
    parserOptions: {
      tsconfigRootDir: import.meta.dirname
    },
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/ban-ts-comment': 'off'
    }
  }),
  vue({
    parserOptions: {
      tsconfigRootDir: import.meta.dirname
    },
    composable: true,
    typescript: true
  }),
  jsonc({
    json: true,
    json5: true,
    jsonc: true,
    prettier: true
  }),
  yaml({
    prettier: true
  }),
  markdown({
    rules: {
      'import/extensions': 'off'
    }
  }),
  vitest(),
  prettier(),
  // @ts-expect-error -- FIXME
  globalIgnores([
    '.vscode',
    'docs/.vitepress/cache',
    'docs/.vitepress/config.ts',
    'docs/api',
    '**/dist/**',
    'lib',
    'tsconfig.json',
    'pnpm-lock.yaml',
    'playground/bun',
    'playground/deno'
  ])
)

export default config
