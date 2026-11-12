import { defineConfig } from 'vite-plus'

export default defineConfig({
  pack: {
    entry: ['./src/index.ts'],
    outDir: 'lib',
    clean: true,
    publint: true,
    dts: true,
    fixedExtension: false,
    deps: {
      neverBundle: ['@gunshi/plugin']
    }
  }
})
