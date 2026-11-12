import {
  defaultIgnoreFilesOfEnforceHeaderCommentRule,
  defineFmtConfig,
  defineLintConfig
} from '@kazupon/vp-config'
import { defineConfig } from 'vite-plus'
import { defaultExclude } from 'vite-plus/test/config'

const SCRIPT_EXTENSIONS = '{js,mjs,cjs,ts,mts,cts,jsx,tsx}'

export default defineConfig({
  staged: {
    '*': 'vp check --fix'
  },
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
  },
  lint: defineLintConfig({
    ignorePatterns: [
      '**/lib/**',
      '**/dist/**',
      '.notes',
      '.slides',
      '.claude',
      '.vscode',
      'tsconfig.json',
      'bench/**',
      'pnpm-lock.yaml',
      'playground/**',
      'design/**',
      './packages/docs/**',
      'packages/docs/src/.vitepress/**',
      // NOTE(kazupon): ignore generated docs
      './packages/plugin-*/docs/**/*.md',
      'CHANGELOG.md',
      '.github/FUNDING.yml',
      '.plans/**',
      '.issues/**'
    ],
    typescript: {
      rules: {
        'typescript/consistent-type-imports': 'off'
      }
    },
    comments: {
      noTagComments: {
        tags: ['TODO', 'FIXME', 'BUG']
      },
      enForceHeaderComment: {
        ignoreFiles: [
          ...defaultIgnoreFilesOfEnforceHeaderCommentRule,
          `packages/**/test/**/*.${SCRIPT_EXTENSIONS}`,
          '**/bin/*.{js,mjs,cjs}',
          `**/fixtures/**.${SCRIPT_EXTENSIONS}`,
          `**/examples/**.${SCRIPT_EXTENSIONS}`,
          `**/.vitepress/**/*.${SCRIPT_EXTENSIONS}`,
          `**/scripts/*.${SCRIPT_EXTENSIONS}`
        ]
      }
    },
    jsdoc: { typescript: 'syntax' },
    regexp: {},
    overrides: [
      {
        // NOTE(kazupon): test codes
        files: ['packages/plugin-i18n/test/*.ts', 'packages/gunshi/test/**/*.ts'],
        rules: {
          'ox-jsdoc/require-jsdoc': 'off',
          'ox-jsdoc/require-description': 'off',
          'ox-jsdoc/require-param-description': 'off',
          'ox-jsdoc/require-returns': 'off'
        }
      }
    ]
  }),
  fmt: defineFmtConfig({
    printWidth: 100,
    proseWrap: 'preserve',
    ignorePatterns: ['CHANGELOG.md', 'pnpm-lock.yaml', '.plans/**', '.issues/**', '.notes/**']
  })
})
