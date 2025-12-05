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
        './e2e/**',
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
      './playground/**',
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
      tsconfigRootDir: import.meta.dirname,
      project: true
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
    preferences: true,
    rules: {
      // @ts-ignore
      'unused-imports/no-unused-imports': 'off',
      'import/export': 'off',
      'import/default': 'off',
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off',
      'import/namespace': 'off',
      'import/no-duplicates': 'off',
      'no-unused-labels': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      // eslint-plugin-markdown-preferences rules
      'markdown-preferences/canonical-code-block-language': 'error',
      'markdown-preferences/emoji-notation': 'error',
      // 'markdown-preferences/heading-casing': 'error',
      'markdown-preferences/ordered-list-marker-start': 'error',
      // 'markdown-preferences/prefer-inline-code-words': 'error'
      // 'markdown-preferences/prefer-linked-words': 'error'
      'markdown-preferences/table-header-casing': 'error',
      'markdown-preferences/bullet-list-marker-style': 'error',
      'markdown-preferences/code-fence-style': 'error',
      'markdown-preferences/emphasis-delimiters-style': 'error',
      'markdown-preferences/level1-heading-style': 'error',
      'markdown-preferences/level2-heading-style': 'error',
      'markdown-preferences/link-destination-style': 'error',
      'markdown-preferences/link-title-style': 'error',
      'markdown-preferences/ordered-list-marker-style': 'error',
      // 'markdown-preferences/prefer-link-reference-definitions': 'error'
      'markdown-preferences/strikethrough-delimiters-style': 'error',
      'markdown-preferences/thematic-break-character-style': 'error',
      'markdown-preferences/code-fence-spacing': 'error',
      'markdown-preferences/custom-container-marker-spacing': 'error',
      // 'markdown-preferences/indent': 'error',
      'markdown-preferences/link-bracket-newline': 'error',
      'markdown-preferences/link-bracket-spacing': 'error',
      'markdown-preferences/link-paren-newline': 'error',
      'markdown-preferences/link-paren-spacing': 'error',
      'markdown-preferences/no-multi-spaces': 'error',
      'markdown-preferences/no-multiple-empty-lines': 'error',
      'markdown-preferences/no-trailing-spaces': 'error',
      'markdown-preferences/padded-custom-containers': 'error',
      'markdown-preferences/padding-line-between-blocks': 'error',
      'markdown-preferences/table-pipe-spacing': 'error',
      'markdown-preferences/atx-heading-closing-sequence-length': 'error',
      'markdown-preferences/atx-heading-closing-sequence': 'error',
      'markdown-preferences/code-fence-length': 'error',
      'markdown-preferences/ordered-list-marker-sequence': 'error',
      'markdown-preferences/setext-heading-underline-length': 'error',
      // 'markdown-preferences/sort-definitions': 'error'
      'markdown-preferences/table-leading-trailing-pipes': 'error',
      'markdown-preferences/table-pipe-alignment': 'error',
      'markdown-preferences/thematic-break-length': 'error',
      'markdown-preferences/thematic-break-sequence-pattern': 'error'
    }
  }),
  vitest(),
  prettier(),
  includeIgnoreFile(gitignorePath),
  globalIgnores([
    '.vscode',
    'tsconfig.json',
    './bench/**',
    'pnpm-lock.yaml',
    'playground/**',
    './packages/docs/**',
    './packages/plugin-*/docs/**/*.md', // NOTE(kazupon): ignore generated docs
    'design/**',
    'CHANGELOG.md',
    '.github/FUNDING.yml',
    'design/**'
  ]) as Linter.Config
)

export default config
