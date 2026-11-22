import { defineConfig } from 'vite-plus'

const shared = {
  outDir: 'lib',
  publint: true,
  fixedExtension: false,
  dts: true,
  deps: {
    alwaysBundle: ['gunshi/plugin', 'gunshi/utils'],
    // NOTE(kazupon): Inline `args-tokens` types into the bundled `.d.ts` to hide it as a transitive
    // type dependency for consumers. Declarations follow the JS bundling by default (tsdown
    // 0.22.1+), and `args-tokens` is not a dependency, so it is bundled anyway. `deps.dts` states
    // the intent, and keeps the types inlined even if `args-tokens` becomes a dependency. See
    // `NOTES.md`.
    dts: {
      alwaysBundle: ['args-tokens', 'args-tokens/utils']
    }
  }
}

export default defineConfig({
  // NOTE(kazupon): built one by one, so that importing `@gunshi/plugin` still loads one file: built
  // together, the code that both use goes to a chunk that every CLI with an official plugin loads.
  pack: [
    { ...shared, entry: ['./src/index.ts'] },
    { ...shared, entry: ['./src/utils.ts'], clean: false }
  ]
})
