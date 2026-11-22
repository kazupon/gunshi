import { defineConfig } from 'vite-plus'
import license from 'rollup-plugin-license'

export default defineConfig({
  pack: {
    entry: ['./src/index.ts'],
    outDir: 'lib',
    publint: true,
    dts: true,
    fixedExtension: false,
    // NOTE(kazupon): `@gunshi/plugin-i18n` is an optional peer dependency, and the sources import only its types.
    // Without this, the bundled `.d.ts` keeps an empty `import "@gunshi/plugin-i18n"`, which is a type error with
    // `skipLibCheck: false` where the plugin is not installed.
    treeshake: {
      moduleSideEffects: [{ test: /^@gunshi\/plugin-i18n$/, external: true, sideEffects: false }]
    },
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
