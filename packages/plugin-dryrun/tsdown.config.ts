import { defineConfig } from 'tsdown'

import type { UserConfig } from 'tsdown'

const config: UserConfig = defineConfig({
  entry: ['./src/index.ts'],
  outDir: 'lib',
  clean: true,
  publint: true,
  dts: true,
  fixedExtension: false,
  deps: {
    neverBundle: ['@gunshi/plugin']
  }
})

export default config
