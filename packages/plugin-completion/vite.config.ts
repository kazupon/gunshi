import { defineConfig } from 'vite-plus'
import license from 'rollup-plugin-license'

export default defineConfig({
  pack: {
    entry: ['./src/index.ts'],
    outDir: 'lib',
    publint: true,
    dts: true,
    fixedExtension: false,
    deps: {
      neverBundle: ['@gunshi/plugin']
    },
    plugins: [
      license({
        banner:
          '/*! license ISC \n * @author Bombshell team and Bombshell contributors\n * Bombshell related codes are forked from @bombsh/tab\n */\n'
      })
    ]
  }
})
