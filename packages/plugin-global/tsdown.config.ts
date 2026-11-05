import { defineConfig } from 'tsdown'

import type { UserConfig } from 'tsdown'

const config: UserConfig = defineConfig({
  entry: ['./src/index.ts'],
  outDir: 'lib',
  publint: true,
  dts: true,
  fixedExtension: false,
  deps: {
    alwaysBundle: ['@gunshi/shared'],
    neverBundle: ['@gunshi/plugin']
  }
})

export default config
