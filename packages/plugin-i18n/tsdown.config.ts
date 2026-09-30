import { lintJsrExports } from 'jsr-exports-lint/tsdown'
import { defineConfig } from 'tsdown'

import type { UserConfig } from 'tsdown'

const config: UserConfig = defineConfig({
  entry: ['./src/index.ts'],
  outDir: 'lib',
  publint: true,
  fixedExtension: false,
  dts: true,
  deps: {
    alwaysBundle: ['@gunshi/shared'],
    neverBundle: ['@gunshi/plugin'],
    // NOTE(kazupon): Inline `args-tokens` types into the bundled `.d.ts` so that `deno check` does
    // not try to resolve `args-tokens` as a dependency, and to hide it as a transitive type
    // dependency for consumers. Declarations follow the JS bundling by default (tsdown 0.22.1+),
    // and `args-tokens` is not a dependency, so it is bundled anyway. `deps.dts` states the intent,
    // and keeps the types inlined even if `args-tokens` becomes a dependency. See `NOTES.md`.
    dts: {
      alwaysBundle: ['args-tokens']
    }
  },
  hooks: {
    'build:done': lintJsrExports()
  }
})

export default config
