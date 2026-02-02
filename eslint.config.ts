import { comments, defineConfig, jsdoc, jsonc, markdown, vue, yaml } from '@kazupon/eslint-config'
import oxlint from 'eslint-plugin-oxlint'
import tseslint from 'typescript-eslint'

const config: ReturnType<typeof defineConfig> = defineConfig(
  tseslint.configs.base,
  comments({ kazupon: false }),
  jsdoc({
    typescript: 'syntax',
    ignores: [
      './playground/**',
      './packages/plugin-i18n/test/*.ts', // NOTE(kazupon): test codes
      './packages/gunshi/test/*.ts' // NOTE(kazupon): test codes
    ]
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
    preferences: true
  }),
  ...oxlint.buildFromOxlintConfigFile('./.oxlintrc.json')
)

export default config
