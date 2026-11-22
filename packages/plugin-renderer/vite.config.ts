import { defineConfig } from 'vite-plus'

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
      alwaysBundle: ['@gunshi/shared'],
      neverBundle: ['@gunshi/plugin'],
      // NOTE(kazupon): Inline `args-tokens` types, which come through the bundled `@gunshi/shared`,
      // into the bundled `.d.ts` to hide it as a transitive type dependency for consumers.
      // Declarations follow the JS bundling by default (tsdown 0.22.1+), and `args-tokens` is not a
      // dependency, so it is bundled anyway. `deps.dts` states the intent, and keeps the types
      // inlined even if `args-tokens` becomes a dependency. See `NOTES.md`.
      dts: {
        alwaysBundle: ['args-tokens']
      }
    }
  }
})
