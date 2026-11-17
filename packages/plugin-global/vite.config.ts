import { defineConfig } from 'vite-plus'

export default defineConfig({
  pack: {
    entry: ['./src/index.ts'],
    outDir: 'lib',
    publint: true,
    dts: true,
    fixedExtension: false,
    deps: {
      alwaysBundle: ['@gunshi/shared'],
      neverBundle: ['@gunshi/plugin']
    }
  }
})
