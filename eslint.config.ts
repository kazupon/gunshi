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
  typescript,
  unicorn,
  vitest,
  yaml
} from '@kazupon/eslint-config'
import { globalIgnores } from 'eslint/config'

const config: ReturnType<typeof defineConfig> = defineConfig(
  javascript(),
  imports({
    typescript: true,
    rules: {
      'import/extensions': ['error', 'always', { ignorePackages: true }]
    }
  }),
  comments(),
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
  globalIgnores([
    '.vscode',
    'docs/.vitepress/cache',
    '**/dist/**',
    'lib',
    'tsconfig.json',
    'pnpm-lock.yaml',
    'playground/bun',
    'playground/deno'
  ])
)

export default config
