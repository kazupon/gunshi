import { lintJsrExports } from 'jsr-exports-lint/tsdown'
import { defineConfig } from 'tsdown'

import type { UserConfig } from 'tsdown'

const config: UserConfig = defineConfig({
  entry: ['./src/index.ts'],
  outDir: 'lib',
  clean: true,
  publint: true,
  dts: true,
  external: ['@gunshi/plugin'],
  hooks: {
    'build:done': lintJsrExports()
  }
})

export default config
