import { lintJsrExports } from 'jsr-exports-lint/tsdown'
import { defineConfig } from 'tsdown'

import type { UserConfig } from 'tsdown'

const config: UserConfig = defineConfig({
  entry: ['./src/index.ts'],
  outDir: 'lib',
  publint: true,
  fixedExtension: false,
  // NOTE(kazupon): Inline `args-tokens` types into the bundled `.d.ts` to hide
  // it as a transitive type dependency for consumers. Requires
  // `rolldown-plugin-dts` <= 0.20 (the `resolve` array API was removed in
  // 0.21). See `overrides` in pnpm-workspace.yaml.
  dts: {
    resolve: ['args-tokens', 'args-tokens/utils']
  },
  noExternal: ['gunshi/utils'],
  hooks: {
    'build:done': lintJsrExports()
  }
})

export default config
