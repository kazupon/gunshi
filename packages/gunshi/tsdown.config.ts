import { lintJsrExports } from 'jsr-exports-lint/tsdown'
import { defineConfig } from 'tsdown'

import type { UserConfig } from 'tsdown'

const config: UserConfig = defineConfig({
  entry: [
    './src/index.ts',
    './src/bone.ts',
    './src/definition.ts',
    './src/context.ts',
    './src/plugin.ts',
    './src/renderer.ts',
    './src/generator.ts',
    './src/utils.ts',
    './src/combinators.ts',
    './src/agent.ts'
  ],
  outDir: 'lib',
  publint: true,
  fixedExtension: false,
  // NOTE(kazupon): Inline `args-tokens` and `std-env` types into the bundled
  // `.d.ts` to hide them as transitive type dependencies for consumers.
  // Requires `rolldown-plugin-dts` <= 0.20 (the `resolve` array API was
  // removed in 0.21). See `overrides` in pnpm-workspace.yaml.
  dts: {
    resolve: ['args-tokens', 'args-tokens/utils', 'args-tokens/combinators', 'std-env']
  },
  noExternal: [
    '@gunshi/plugin-global',
    '@gunshi/plugin-renderer',
    '@gunshi/plugin-i18n',
    'std-env'
  ],
  hooks: {
    'build:done': lintJsrExports()
  }
})

export default config
