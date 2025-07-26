import { lintJsrExports } from 'jsr-exports-lint/tsdown'
import license from 'rollup-plugin-license'
import { defineConfig } from 'tsdown'

const config: ReturnType<typeof defineConfig> = defineConfig({
  entry: ['./src/index.ts'],
  outDir: 'lib',
  clean: true,
  publint: true,
  dts: true,
  external: ['@gunshi/plugin'],
  plugins: [
    license({
      banner:
        '/*! license ISC \n * @author Bombshell team and Bombshell contributors\n * Bombshell related codes are forked from @bombsh/tab\n */\n'
    })
  ],
  hooks: {
    'build:done': lintJsrExports()
  }
})

export default config
