import { defineConfig } from 'vite-plus'

export default defineConfig({
  pack: {
    entry: ['./src/index.ts'],
    outDir: 'lib',
    publint: true,
    fixedExtension: false,
    dts: true
  }
})
