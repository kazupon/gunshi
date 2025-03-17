import type { KnipConfig } from 'knip'

export default {
  entry: ['src/index.ts', 'eslint.config.ts', 'tsdown.config.ts', 'docs/.vitepress/config.ts'],
  ignore: ['playground/deno/main.ts', 'src/constants.ts'],
  ignoreDependencies: ['lint-staged']
} satisfies KnipConfig
