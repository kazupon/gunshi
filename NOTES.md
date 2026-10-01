# Notes

## Bundling

### Background

gunshi aims to be a **zero-dependency** package on npm to maximize `npm install` performance for end users. To achieve this, runtime dependencies such as `args-tokens` are inlined into the published bundle rather than declared as `dependencies`. This keeps the install graph minimal and avoids forcing consumers to download additional packages just to use gunshi.

The notes below describe how this is implemented in practice and the constraints it places on the build toolchain.

### `args-tokens` bundling status across `packages/*`

How each package under `packages/*` handles `args-tokens`, based on actual inspection of build outputs (`lib/*.js`, `lib/*.d.ts`).

Verified with: `tsdown@0.22.14` + `rolldown-plugin-dts@0.27.14` (`tsdown@0.23` is not used yet; see [Why we stay on tsdown 0.22](#why-we-stay-on-tsdown-022)).

#### Results

| Package           | What `src/index.ts` mainly contains                             | Bundled into JS                                   | Inlined into `.d.ts` | Category         |
| ----------------- | --------------------------------------------------------------- | ------------------------------------------------- | -------------------- | ---------------- |
| `gunshi`          | Core implementation (uses `parseArgs` / `resolveArgs` directly) | Yes (`combinators.js`, `core-*.js`, `utils-*.js`) | Yes                  | JS impl included |
| `bone`            | `export * from 'gunshi/bone'`                                   | Yes (`index.js` contains parser/utils/resolver)   | Yes                  | JS impl included |
| `combinators`     | `export * from 'gunshi/combinators'`                            | Yes (`index.js` contains combinators)             | Yes                  | JS impl included |
| `shared`          | `export * from 'gunshi/utils'` + own logic                      | Yes (`index.js` contains utils)                   | Yes                  | JS impl included |
| `definition`      | Type-only references from `gunshi/context`                      | No                                                | Yes                  | Types only       |
| `plugin`          | Type-only references from `gunshi`                              | No                                                | Yes                  | Types only       |
| `plugin-i18n`     | Type-only references from `gunshi` / `@gunshi/*`                | No                                                | Yes                  | Types only       |
| `plugin-renderer` | Type-only references through the bundled `@gunshi/shared`       | No                                                | Yes                  | Types only       |

#### How the bundling happens

- **JS bundle**: `args-tokens` is declared under `devDependencies`, so tsdown bundles it by default (only `dependencies` / `peerDependencies` / `optionalDependencies` are auto-externalized).
- **`.d.ts` inlining**: Since tsdown 0.22.1, declaration files follow the JS bundling by default, so the `args-tokens` types are inlined as well. Each `tsdown.config.ts` also lists them in `deps.dts.alwaysBundle` (`['args-tokens', ...]`), to state the intent and to keep the types inlined even if `args-tokens` becomes a dependency.

#### Design intent

The goal is to **completely hide `args-tokens` from the public API** of gunshi. Consumers should not need to install `args-tokens` separately — both runtime and types stay enclosed within `gunshi` / `@gunshi/*`.

- "JS impl included" group (`gunshi` / `bone` / `combinators` / `shared`): both runtime and types are inlined.
- "Types only" group (`definition` / `plugin` / `plugin-i18n` / `plugin-renderer`): does not use the `args-tokens` runtime internally, but the re-exported type chain references `args-tokens`, so only `.d.ts` inlining is required.

#### Why we stay on tsdown 0.22

- `tsdown@0.23` uses `rolldown-plugin-dts@0.28`. Since `rolldown-plugin-dts@0.28.2`, a chunk whose exports are all inlined as `export declare …` / `export type …` gets no `export {}` marker ([issue #312](https://github.com/sxzz/rolldown-plugin-dts/issues/312)). In a `.d.ts` module without any export declaration, TypeScript treats every top-level declaration as exported, so internal declarations become importable at the type level, while the JS does not export them. Across the gunshi packages, 65 such names appear (for example `COMMON_ARGS` from `@gunshi/plugin-i18n`).
- Until it is fixed, the catalog in `pnpm-workspace.yaml` pins `tsdown` to `0.22.14`, and `.github/renovate.json` holds Renovate below `0.23.0` (`allowedVersions`), since Renovate automerges the updates that pass CI.
- History: up to `tsdown@0.21`, the types were inlined with the array form of `dts.resolve`, which was removed in `rolldown-plugin-dts` v0.21.0 ([issue #106](https://github.com/sxzz/rolldown-plugin-dts/issues/106)), so `rolldown-plugin-dts` was pinned to 0.20.0. [Issue #199](https://github.com/sxzz/rolldown-plugin-dts/issues/199) was resolved by the `deps.dts` option of `tsdown@0.22.1`.

#### Future plans

Move to `tsdown@0.23` once issue #312 is fixed. Before moving, compare the public API of the built `.d.ts` files with the current ones: no name may be added or removed, and no `.d.ts` may import `args-tokens`.

## Package Manager

### pnpm version

The repository uses pnpm v12. The exact version is pinned by the `packageManager` field in `package.json`, and in the `package.json` of each playground project.

pnpm v11 changed where it reads its settings, and pnpm v12 checks more when it installs. The settings that follow from it:

- **`allowBuilds`** in `pnpm-workspace.yaml` lists the dependencies that may run install scripts. It replaces `onlyBuiltDependencies`, which pnpm v11 removed. `strictDepBuilds` is on by default, so an install fails when a dependency with an install script is not listed (`deno` and `esbuild` today)
- **The settings live in `pnpm-workspace.yaml`.** pnpm v11 no longer reads the `pnpm` field of `package.json`, and reads only the auth and registry settings from `.npmrc`. `shellEmulator: true` moved from `.npmrc` for that reason
- **`devEngines.runtime`** of the root `package.json` is checked on install. Deno and Bun are needed only by the E2E tests, and the E2E job installs them, so their `onFail` is `ignore`. With `error`, the CI jobs without Bun fail to install. With `warn`, pnpm prints the warning to stdout on every command, which breaks the snapshot tests of `plugin-completion` that run `pnpm exec`
- **`ignoreWorkspaceCycles: true`**: the packages depend on each other through devDependencies (e.g. `@gunshi/bone` → `gunshi` → `@gunshi/plugin-i18n` → `@gunshi/bone`), and pnpm v11 and later refuse to run recursive tasks across such cycles without it. The order within a cycle does not matter for the build, since each package bundles the others from their sources (`paths` of `tsconfig.json`). The output is byte for byte the same in any order
- **`lint:jsr` runs one package at a time** (`--workspace-concurrency=1`). With the cycles ignored, two packages start at once, and on a fresh install their `jsr publish --dry-run` download the JSR binary to the same place, which fails with `ENOENT`

pnpm v11.0.9 once failed on GitHub Actions because `rolldown` could not resolve its Linux native optional dependency (`Cannot find module '@rolldown/binding-linux-x64-gnu'`). This does not happen with pnpm v12.6.0: install and build pass on linux/amd64, and the output is the same as on macOS.
