import { defineConfig } from 'tsdown'

const config: ReturnType<typeof defineConfig> = defineConfig({
  entry: ['src/index.ts', 'src/context.ts', 'src/renderer/index.ts', 'src/generator.ts'],
  outDir: 'lib',
  dts: true
})

export default config
