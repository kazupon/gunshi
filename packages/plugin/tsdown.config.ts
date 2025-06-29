import { lintJsrExports } from 'jsr-exports-lint/tsdown'
import { defineConfig } from 'tsdown'

const config: ReturnType<typeof defineConfig> = defineConfig({
  entry: ['./src/index.ts'],
  outDir: 'lib',
  clean: true,
  publint: true,
  dts: {
    resolve: ['args-tokens']
  },
  noExternal: ['gunshi/plugin'],
  hooks: {
    'build:done': lintJsrExports()
  }
})

export default config
