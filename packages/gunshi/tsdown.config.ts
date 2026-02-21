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
    './src/combinators.ts'
  ],
  outDir: 'lib',
  clean: true,
  publint: true,
  dts: {
    resolve: ['args-tokens', 'args-tokens/utils', 'args-tokens/combinators']
  },
  noExternal: ['@gunshi/plugin-global', '@gunshi/plugin-renderer', '@gunshi/plugin-i18n'],
  hooks: {
    'build:done': lintJsrExports()
  }
})

export default config
