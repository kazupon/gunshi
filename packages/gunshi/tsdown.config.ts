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
  dts: true,
  deps: {
    alwaysBundle: [
      '@gunshi/plugin-global',
      '@gunshi/plugin-renderer',
      '@gunshi/plugin-i18n',
      'std-env'
    ],
    // NOTE(kazupon): Inline `args-tokens` and `std-env` types into the bundled `.d.ts` to hide them
    // as transitive type dependencies for consumers. Declarations follow the JS bundling by default
    // (tsdown 0.22.1+), and neither is a dependency, so both are bundled anyway. `deps.dts` states
    // the intent, and keeps the types inlined even if they become dependencies. See `NOTES.md`.
    dts: {
      alwaysBundle: ['args-tokens', 'args-tokens/utils', 'args-tokens/combinators', 'std-env']
    }
  },
  hooks: {
    'build:done': lintJsrExports()
  }
})

export default config
