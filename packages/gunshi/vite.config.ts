import { defineConfig } from 'vite-plus'

export default defineConfig({
  pack: {
    entry: [
      './src/index.ts',
      './src/bone.ts',
      './src/definition.ts',
      './src/context.ts',
      './src/plugin.ts',
      './src/renderer.ts',
      './src/generator.ts',
      './src/utils.ts',
      './src/combinators.ts',
      './src/agent.ts'
    ],
    outDir: 'lib',
    // NOTE(kazupon): put the JavaScript that two or more entries use in one shared chunk, so that importing
    // `gunshi` loads two files, the entry and the shared chunk. Node.js spends time on each module that it loads,
    // by their number more than by their size, and the default splitting made ten of them. `minShareCount: 2`
    // keeps the code that only one entry uses in the file of that entry, such as the bundled std-env of
    // `gunshi/agent`, which reads `process.stdout` when it is loaded. The declarations are left out of the group,
    // which would otherwise give their shared chunk the name of the JavaScript one, so they are split as before.
    outputOptions: {
      codeSplitting: {
        groups: [
          { name: 'shared', test: (id: string) => !/\.d\.[cm]?ts$/.test(id), minShareCount: 2 }
        ]
      }
    },
    publint: true,
    fixedExtension: false,
    dts: true,
    deps: {
      alwaysBundle: [
        '@gunshi/plugin-global',
        '@gunshi/plugin-renderer',
        '@gunshi/plugin-i18n',
        'std-env'
      ],
      // NOTE(kazupon): Inline `args-tokens` and `std-env` types into the bundled `.d.ts` to hide them
      // as transitive type dependencies for consumers. Declarations follow the JS bundling by default
      // (tsdown 0.22.1+), and neither is a dependency, so both are bundled anyway. `deps.dts` states
      // the intent, and keeps the types inlined even if they become dependencies. See `NOTES.md`.
      dts: {
        alwaysBundle: ['args-tokens', 'args-tokens/utils', 'args-tokens/combinators', 'std-env']
      }
    }
  }
})
