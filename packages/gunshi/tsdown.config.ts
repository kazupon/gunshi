import { lintJsrExports } from 'jsr-exports-lint/tsdown'
import { defineConfig } from 'tsdown'

const config: ReturnType<typeof defineConfig> = defineConfig({
  entry: [
    './src/index.ts',
    './src/definition.ts',
    './src/context.ts',
    './src/plugin.ts',
    './src/renderer.ts',
    './src/generator.ts',
    './src/utils.ts'
  ],
  outDir: 'lib',
  clean: true,
  publint: true,
  dts: true,
  hooks: {
    'build:done': lintJsrExports()
  }
})

export default config
