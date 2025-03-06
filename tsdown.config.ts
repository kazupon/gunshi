import { defineConfig } from 'tsdown'

const config: ReturnType<typeof defineConfig> = defineConfig({
  entry: ['src/index.ts', 'src/context.ts', 'src/renderer.ts'],
  outDir: 'lib',
  dts: true
})

export default config
