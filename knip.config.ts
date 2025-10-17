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
      ignore: ['examples/**/*.ts', 'src/bombshell/*.ts']
    },
    'packages/docs': {
      entry: ['src/.vitepress/config.ts', 'src/.vitepress/theme/index.ts']
    }
  },
  ignore: [
    'playground/deno/main.ts',
    '**/src/**.test-d.ts',
    'bench/**',
    'design/**/*.ts',
    'playground/**'
  ],
  ignoreDependencies: ['lint-staged', 'deno', 'mitata', 'gunshi019']
} satisfies KnipConfig
