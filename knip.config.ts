import type { KnipConfig } from 'knip'

export default {
  entry: [
    'src/index.ts',
    'eslint.config.ts',
    'tsdown.config.ts',
    'typedoc.config.mjs',
    'docs/.vitepress/config.ts',
    'docs/.vitepress/theme/index.ts'
  ],
  ignore: ['playground/deno/main.ts', 'src/constants.ts'],
  ignoreDependencies: ['lint-staged', 'deno']
} satisfies KnipConfig
