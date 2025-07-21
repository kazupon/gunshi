import type { KnipConfig } from 'knip'

export default {
  workspaces: {
    '.': {
      entry: ['scripts/*.ts'],
      project: '**/*.ts'
    },
    'packages/gunshi': {
      entry: ['src/constants.ts']
    },
    'packages/plugin-completion': {
      ignore: ['examples/**/*.ts']
    },
    'packages/docs': {
      entry: ['src/.vitepress/config.ts', 'src/.vitepress/theme/index.ts']
    }
  },
  ignore: ['playground/deno/main.ts', '**/src/**.test-d.ts', 'bench/**', 'design/**/*.ts'],
  ignoreDependencies: ['lint-staged', 'deno', 'mitata']
} satisfies KnipConfig
