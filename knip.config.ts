import type { KnipConfig } from 'knip'

export default {
  workspaces: {
    '.': {
      entry: ['scripts/*.ts', 'bump.config.ts', 'vitest.e2e.config.ts'],
      project: '**/*.ts'
    },
    'packages/gunshi': {
      entry: [
        'src/index.ts',
        'src/bone.ts',
        'src/definition.ts',
        'src/context.ts',
        'src/plugin.ts',
        'src/renderer.ts',
        'src/generator.ts',
        'src/utils.ts',
        'src/combinators.ts',
        'src/agent.ts',
        'src/constants.ts'
      ]
    },
    'packages/bone': {
      entry: ['src/index.ts']
    },
    'packages/combinators': {
      entry: ['src/index.ts']
    },
    'packages/definition': {
      entry: ['src/index.ts']
    },
    'packages/plugin': {
      entry: ['src/index.ts']
    },
    'packages/plugin-dryrun': {
      entry: ['src/index.ts']
    },
    'packages/plugin-global': {
      entry: ['src/index.ts']
    },
    'packages/plugin-renderer': {
      entry: ['src/index.ts']
    },
    'packages/plugin-suggestion': {
      entry: ['src/index.ts']
    },
    'packages/resources': {
      entry: ['src/index.ts']
    },
    'packages/shared': {
      entry: ['src/index.ts']
    },
    'packages/plugin-completion': {
      entry: ['src/index.ts'],
      ignore: ['examples/**/*.ts', 'src/bombshell/*.ts']
    },
    'packages/plugin-i18n': {
      entry: ['src/index.ts'],
      ignoreDependencies: ['@gunshi/plugin-global']
    },
    'packages/docs': {
      entry: ['src/.vitepress/config.ts', 'src/.vitepress/theme/index.ts'],
      ignore: ['src/.vitepress/banner.js', 'src/.vitepress/theme/components/GunshiBanner.vue'],
      ignoreDependencies: [
        '@vueuse/core',
        // API reference generation reads built declaration files from these
        // workspace packages during the docs build.
        '@gunshi/plugin-i18n',
        '@gunshi/plugin-renderer'
      ]
    }
  },
  ignore: ['**/src/**.test-d.ts', 'bench/**', 'design/**/*.ts', 'playground/**'],
  ignoreDependencies: [
    'mitata',
    'gunshi019',
    // `vp pack` runs publint with `pack.publint`, which the vite-plus plugin of knip does not read
    'publint'
  ],
  ignoreBinaries: [
    // `pnpm view` is a built-in pnpm subcommand, not a separate binary.
    // Used in .github/workflows/release.yml for idempotency checks.
    'view'
  ]
} satisfies KnipConfig
