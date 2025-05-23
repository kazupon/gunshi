import type { KnipConfig } from 'knip'

export default {
  entry: [
    'src/index.ts',
    'src/definition.ts',
    'src/generator.ts',
    'src/renderer.ts',
    'vitest.config.ts',
    'eslint.config.ts',
    'tsdown.config.ts',
    'typedoc.config.mjs',
    'docs/.vitepress/config.ts',
    'docs/.vitepress/theme/index.ts'
  ],
  ignore: ['playground/deno/main.ts', 'src/constants.ts', 'src/**.test-d.ts', 'bench/**'],
  ignoreDependencies: ['lint-staged', 'deno', 'gunshi019', 'mitata']
} satisfies KnipConfig
