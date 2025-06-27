import { lintJsrExports } from 'jsr-exports-lint/tsdown'
import { defineConfig } from 'tsdown'

const config: ReturnType<typeof defineConfig> = defineConfig({
  entry: ['./src/index.ts'],
  outDir: 'lib',
  clean: true,
  publint: true,
  dts: true,
  external: ['gunshi', 'gunshi/plugin', 'gunshi/utils'],
  hooks: {
    'build:done': lintJsrExports()
  }
})

export default config
