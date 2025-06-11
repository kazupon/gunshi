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
    'packages/docs': {
      entry: ['src/.vitepress/config.ts', 'src/.vitepress/theme/index.ts']
    }
  },
  ignore: ['playground/deno/main.ts', '**/src/**.test-d.ts', 'bench/**'],
  ignoreDependencies: ['lint-staged', 'deno', 'gunshi019', 'mitata', '@typescript/native-preview']
} satisfies KnipConfig
