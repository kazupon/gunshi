# Notes

## Bundling

### Background

gunshi aims to be a **zero-dependency** package on npm to maximize `npm install` performance for end users. To achieve this, runtime dependencies such as `args-tokens` are inlined into the published bundle rather than declared as `dependencies`. This keeps the install graph minimal and avoids forcing consumers to download additional packages just to use gunshi.

The notes below describe how this is implemented in practice and the constraints it places on the build toolchain.

### `args-tokens` bundling status across `packages/*`

How each package under `packages/*` handles `args-tokens`, based on actual inspection of build outputs (`lib/*.js`, `lib/*.d.ts`).

Verified with: `tsdown@0.21.0` + `rolldown-plugin-dts@0.20.0` (pinned via `overrides` in `pnpm-workspace.yaml`).

#### Results

| Package       | What `src/index.ts` mainly contains                             | Bundled into JS                                   | Inlined into `.d.ts` | Category         |
| ------------- | --------------------------------------------------------------- | ------------------------------------------------- | -------------------- | ---------------- |
| `gunshi`      | Core implementation (uses `parseArgs` / `resolveArgs` directly) | Yes (`combinators.js`, `core-*.js`, `utils-*.js`) | Yes                  | JS impl included |
| `bone`        | `export * from 'gunshi/bone'`                                   | Yes (`index.js` contains parser/utils/resolver)   | Yes                  | JS impl included |
| `combinators` | `export * from 'gunshi/combinators'`                            | Yes (`index.js` contains combinators)             | Yes                  | JS impl included |
| `shared`      | `export * from 'gunshi/utils'` + own logic                      | Yes (`index.js` contains utils)                   | Yes                  | JS impl included |
| `definition`  | Type-only references from `gunshi/context`                      | No                                                | Yes                  | Types only       |
| `plugin`      | Type-only references from `gunshi`                              | No                                                | Yes                  | Types only       |
| `plugin-i18n` | Type-only references from `gunshi` / `@gunshi/*`                | No                                                | Yes                  | Types only       |

#### How the bundling happens

- **JS bundle**: `args-tokens` is declared under `devDependencies`, so tsdown bundles it by default (only `dependencies` / `peerDependencies` / `optionalDependencies` are auto-externalized).
- **`.d.ts` inlining**: Each `tsdown.config.ts` explicitly inlines the types via `dts.resolve: ['args-tokens', ...]`.

#### Design intent

The goal is to **completely hide `args-tokens` from the public API** of gunshi. Consumers should not need to install `args-tokens` separately — both runtime and types stay enclosed within `gunshi` / `@gunshi/*`.

- "JS impl included" group (`gunshi` / `bone` / `combinators` / `shared`): both runtime and types are inlined.
- "Types only" group (`definition` / `plugin` / `plugin-i18n`): does not use the `args-tokens` runtime internally, but the re-exported type chain references `args-tokens`, so only `.d.ts` inlining is required.

#### Why we pin the version

- The array form of `dts.resolve` was removed in `rolldown-plugin-dts` v0.21.0 ([issue #106](https://github.com/sxzz/rolldown-plugin-dts/issues/106)).
- A replacement API for "keep JS external while inlining only types" is not yet provided (tracked at [issue #199](https://github.com/sxzz/rolldown-plugin-dts/issues/199)).
- For this reason, `pnpm-workspace.yaml` pins `tsdown>rolldown-plugin-dts: 0.20.0` via `overrides`.

#### Future plans

The current tsdown-based bundling setup is a workaround. We plan to revisit and improve it in the future — for example, by migrating to a newer `rolldown-plugin-dts` API once an equivalent of the array-form `dts.resolve` becomes available, or by adopting a different toolchain that better supports the "bundle JS, hide as type-only dependency" pattern. Until then, the version pin and `dts.resolve` configuration described above should be kept in place.
