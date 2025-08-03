import { lintJsrExports } from 'jsr-exports-lint/tsdown'
import { defineConfig } from 'tsdown'

import type { UserConfig } from 'tsdown'

const config: UserConfig = defineConfig({
  entry: ['./src/index.ts'],
  outDir: 'lib',
  clean: true,
  publint: true,
  // dts: true,
  // NOTE(kazupon): We need to avoid for `deno check` to resolve `args-tokens` as a dependency.
  dts: {
    resolve: ['args-tokens']
  },
  noExternal: ['@gunshi/shared'],
  external: ['@gunshi/plugin'],
  hooks: {
    'build:done': lintJsrExports()
  }
})

export default config
