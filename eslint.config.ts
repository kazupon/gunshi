import {
  comments,
  defineConfig,
  jsdoc,
  jsonc,
  markdown,
  regexp,
  vue,
  yaml
} from '@kazupon/eslint-config'
import oxlint from 'eslint-plugin-oxlint'
import tseslint from 'typescript-eslint'

const config: ReturnType<typeof defineConfig> = defineConfig(
  tseslint.configs.base,

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
      './packages/plugin-i18n/test/*.ts', // NOTE(kazupon): test codes
      './packages/gunshi/test/*.ts' // NOTE(kazupon): test codes
    ]
  }),
  regexp(),
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
      'import/no-duplicates': 'off'
    }
  }),
  ...oxlint.buildFromOxlintConfigFile('./.oxlintrc.json')
)

export default config
