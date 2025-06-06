import type { KnipConfig } from 'knip'

export default {
  workspaces: {
    '.': {
      entry: ['scripts/*.ts'],
      project: '**/*.ts'
    },
    'packages/gunshi': {
      entry: [
        'src/index.ts',
        'src/definition.ts',
        'src/constants.ts',
        'src/context.ts',
        'src/renderer.ts',
        'src/generator.ts',
        'tsdown.config.ts'
      ]
    },
    'packages/docs': {
      entry: ['src/.vitepress/config.ts', 'src/.vitepress/theme/index.ts']
    }
  },
  ignore: ['playground/deno/main.ts', '**/src/**.test-d.ts', 'bench/**'],
  ignoreDependencies: ['lint-staged', 'deno', 'gunshi019', 'mitata']
} satisfies KnipConfig
