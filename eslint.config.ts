import { includeIgnoreFile } from '@eslint/compat'
import {
  comments,
  defineConfig,
  imports,
  javascript,
  jsdoc,
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
import { fileURLToPath, URL } from 'node:url'

import type { Linter } from 'eslint'

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url))

const config: ReturnType<typeof defineConfig> = defineConfig(
  javascript(),
  stylistic(),
  comments({
    kazupon: {
      ignores: [
        './scripts/**',
        './bench/**',
        './playground/**',
        './packages/docs/**',
        './packages/**/examples/**',
        './**/test/**',
        './**/src/**/*.test.ts',
        './**/src/**/*.test-d.ts'
      ]
    }
  }),
  jsdoc({
    typescript: 'syntax',
    ignores: [
      './packages/plugin-completion/src/bombshell/*.ts', // NOTE(kazupon): bombshell code is forked, so ignore.
      './packages/plugin-i18n/test/*.ts', // NOTE(kazupon): test codes
      './packages/gunshi/test/*.ts' // NOTE(kazupon): test codes
    ]
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
      'unicorn/prefer-string-replace-all': 'off',
      'unicorn/consistent-function-scoping': 'off',
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
      'import/extensions': 'off',
      'unused-imports/no-unused-imports': 'off'
    }
  }),
  vitest(),
  prettier(),
  includeIgnoreFile(gitignorePath),
  globalIgnores([
    '.vscode',
    'tsconfig.json',
    './packages/**/docs/**',
    'pnpm-lock.yaml',
    'playground/**',
    'design/**',
    'CHANGELOG.md',
    'design/**'
  ]) as Linter.Config
)

export default config
