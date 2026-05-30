# ox-content API docs comparison

Generated at: 2026-05-30T06:20:29.043Z

## Inputs

- Current TypeDoc output: `packages/docs/src/api`
- ox-content output: `packages/docs/src/api-ox`
- TypeDoc-compatible entrypoints:
  - `default`: `../gunshi/src/index.ts`
  - `definition`: `../gunshi/src/definition.ts`
  - `context`: `../gunshi/src/context.ts`
  - `plugin`: `../gunshi/src/plugin.ts`
  - `generator`: `../gunshi/src/generator.ts`
  - `renderer`: `../gunshi/src/renderer.ts`
  - `combinators`: `../gunshi/src/combinators.ts`
  - `agent`: `../gunshi/src/agent.ts`
- ox-content npm package: `@ox-content/napi@2.27.0`
- ox-content package path: `node_modules/.pnpm/@ox-content+napi@2.27.0/node_modules/@ox-content/napi/package.json`
- export graph entrypoints: 8
- export graph source modules: 20
- postprocess: generated `<details>` blocks and `<pre><code>` blocks are written with `v-pre`, and braces/newlines inside raw HTML code blocks are entity-escaped, so VitePress/Vue does not parse API signatures and code examples as template HTML.

## Summary

| Metric                                       | Current TypeDoc | ox-content (typedoc) |
| -------------------------------------------- | --------------: | -------------------: |
| Symbol entries                               |              82 |                  152 |
| Unique symbol names                          |              82 |                   82 |
| Markdown pages                               |              91 |                  142 |
| Missing TypeDoc symbols by name              |               - |                    0 |
| Extra ox-content symbols by name             |               - |                    0 |
| Public exports without extracted docs        |               - |                   10 |
| Rendered member entries                      |               - |                  297 |
| ox-content extraction diagnostics            |               - |                   10 |
| ox-content output file collisions            |               - |                    0 |
| ox-content `@internal` entries still emitted |               - |                    0 |

Current TypeDoc kind counts: class: 1, function: 32, interface: 24, type: 23, variable: 2

ox-content kind counts: class: 1, function: 59, interface: 43, type: 46, variable: 3

## URL Samples

| Symbol                   | Current TypeDoc URL                                | ox-content typedoc URL                                                                                                                                                                                         |
| ------------------------ | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cli`                    | `/api/default/functions/cli.md`                    | `/api-ox/default/functions/cli`<br>`/api-ox/default/functions/cli`<br>`/api-ox/default/functions/cli`<br>`/api-ox/default/functions/cli`<br>`/api-ox/default/functions/cli`<br>`/api-ox/default/functions/cli` |
| `define`                 | `/api/definition/functions/define.md`              | `/api-ox/default/functions/define`<br>`/api-ox/default/functions/define`<br>`/api-ox/definition/functions/define`<br>`/api-ox/definition/functions/define`                                                     |
| `Command`                | `/api/default/interfaces/Command.md`               | `/api-ox/default/interfaces/Command`<br>`/api-ox/definition/interfaces/Command`<br>`/api-ox/plugin/interfaces/Command`                                                                                         |
| `Plugin`                 | `/api/default/type-aliases/Plugin.md`              | `/api-ox/default/type-aliases/Plugin`<br>`/api-ox/plugin/type-aliases/Plugin`                                                                                                                                  |
| `DefaultTranslation`     | `/api/default/classes/DefaultTranslation.md`       | `/api-ox/default/classes/DefaultTranslation`                                                                                                                                                                   |
| `ANONYMOUS_COMMAND_NAME` | `/api/default/variables/ANONYMOUS_COMMAND_NAME.md` | `/api-ox/default/variables/ANONYMOUS_COMMAND_NAME`<br>`/api-ox/plugin/variables/ANONYMOUS_COMMAND_NAME`                                                                                                        |
| `CLI_OPTIONS_DEFAULT`    | `/api/plugin/variables/CLI_OPTIONS_DEFAULT.md`     | `/api-ox/plugin/variables/CLI_OPTIONS_DEFAULT`                                                                                                                                                                 |
| `string`                 | `/api/combinators/functions/string.md`             | `/api-ox/combinators/functions/string`                                                                                                                                                                         |

## Missing Current TypeDoc Symbols

These symbols exist in current TypeDoc pages but were not present by symbol name in ox-content entrypoint extraction.

- none

## Extra ox-content Symbols

These symbols appear in ox-content entrypoint extraction but do not have a current TypeDoc symbol page by the same name.

- none

## Public Exports Without Extracted Docs

These exports are present in the ox-content entrypoint export graph but were not rendered as documentation entries. With `externalDocs: true` the remaining items are `@internal` type helpers from `types.ts` / `context.ts` that both TypeDoc (`--excludeInternal`) and ox-content (`internal: false`) intentionally drop, so they are not a coverage gap versus the current TypeDoc output (see "Missing Current TypeDoc Symbols": 0).

- `default`: `ExtractArgs` (type) - local `ExtractArgs` from `/Users/kazuya.kawaguchi/Projects/my/gunshi/packages/gunshi/src/types.ts`
- `default`: `ExtractArgExplicitlyProvided` (type) - local `ExtractArgExplicitlyProvided` from `/Users/kazuya.kawaguchi/Projects/my/gunshi/packages/gunshi/src/types.ts`
- `default`: `ExtractExtensions` (type) - local `ExtractExtensions` from `/Users/kazuya.kawaguchi/Projects/my/gunshi/packages/gunshi/src/types.ts`
- `default`: `NormalizeToGunshiParams` (type) - local `NormalizeToGunshiParams` from `/Users/kazuya.kawaguchi/Projects/my/gunshi/packages/gunshi/src/types.ts`
- `default`: `MergeGunshiExtensions` (type) - local `MergeGunshiExtensions` from `/Users/kazuya.kawaguchi/Projects/my/gunshi/packages/gunshi/src/types.ts`
- `context`: `ExtractExtensionValues` (type) - local `ExtractExtensionValues` from `/Users/kazuya.kawaguchi/Projects/my/gunshi/packages/gunshi/src/context.ts`
- `plugin`: `ExtractArgs` (type) - local `ExtractArgs` from `/Users/kazuya.kawaguchi/Projects/my/gunshi/packages/gunshi/src/types.ts`
- `plugin`: `ExtractExtensions` (type) - local `ExtractExtensions` from `/Users/kazuya.kawaguchi/Projects/my/gunshi/packages/gunshi/src/types.ts`
- `plugin`: `MergeGunshiExtensions` (type) - local `MergeGunshiExtensions` from `/Users/kazuya.kawaguchi/Projects/my/gunshi/packages/gunshi/src/types.ts`
- `plugin`: `NormalizeToGunshiParams` (type) - local `NormalizeToGunshiParams` from `/Users/kazuya.kawaguchi/Projects/my/gunshi/packages/gunshi/src/types.ts`

## ox-content Extraction Diagnostics

Diagnostics reported by `extractDocsFromEntryPoints` for exports it could not turn into documentation entries (e.g. external re-exports without a resolvable source, or unsupported declaration kinds).

- `default`: `ExtractArgs` (type) - [filteredByVisibility] export "ExtractArgs" from entrypoint "default" was excluded from docs because it is marked @internal
- `default`: `ExtractArgExplicitlyProvided` (type) - [filteredByVisibility] export "ExtractArgExplicitlyProvided" from entrypoint "default" was excluded from docs because it is marked @internal
- `default`: `ExtractExtensions` (type) - [filteredByVisibility] export "ExtractExtensions" from entrypoint "default" was excluded from docs because it is marked @internal
- `default`: `NormalizeToGunshiParams` (type) - [filteredByVisibility] export "NormalizeToGunshiParams" from entrypoint "default" was excluded from docs because it is marked @internal
- `default`: `MergeGunshiExtensions` (type) - [filteredByVisibility] export "MergeGunshiExtensions" from entrypoint "default" was excluded from docs because it is marked @internal
- `context`: `ExtractExtensionValues` (type) - [filteredByVisibility] export "ExtractExtensionValues" from entrypoint "context" was excluded from docs because it is marked @internal
- `plugin`: `ExtractArgs` (type) - [filteredByVisibility] export "ExtractArgs" from entrypoint "plugin" was excluded from docs because it is marked @internal
- `plugin`: `ExtractExtensions` (type) - [filteredByVisibility] export "ExtractExtensions" from entrypoint "plugin" was excluded from docs because it is marked @internal
- `plugin`: `MergeGunshiExtensions` (type) - [filteredByVisibility] export "MergeGunshiExtensions" from entrypoint "plugin" was excluded from docs because it is marked @internal
- `plugin`: `NormalizeToGunshiParams` (type) - [filteredByVisibility] export "NormalizeToGunshiParams" from entrypoint "plugin" was excluded from docs because it is marked @internal

## Duplicate ox-content Symbol Names

- `ANONYMOUS_COMMAND_NAME`
  - variable `/api-ox/default/variables/ANONYMOUS_COMMAND_NAME` from `packages/gunshi/src/constants.ts` via `default`
  - variable `/api-ox/plugin/variables/ANONYMOUS_COMMAND_NAME` from `packages/gunshi/src/constants.ts` via `plugin`
- `Args`
  - interface `/api-ox/default/interfaces/Args` from `node_modules/.pnpm/args-tokens@0.25.0/node_modules/args-tokens/lib/resolver.d.ts` via `default`
  - interface `/api-ox/definition/interfaces/Args` from `node_modules/.pnpm/args-tokens@0.25.0/node_modules/args-tokens/lib/resolver.d.ts` via `definition`
  - interface `/api-ox/plugin/interfaces/Args` from `node_modules/.pnpm/args-tokens@0.25.0/node_modules/args-tokens/lib/resolver.d.ts` via `plugin`
- `ArgSchema`
  - interface `/api-ox/default/interfaces/ArgSchema` from `node_modules/.pnpm/args-tokens@0.25.0/node_modules/args-tokens/lib/resolver.d.ts` via `default`
  - interface `/api-ox/definition/interfaces/ArgSchema` from `node_modules/.pnpm/args-tokens@0.25.0/node_modules/args-tokens/lib/resolver.d.ts` via `definition`
  - interface `/api-ox/plugin/interfaces/ArgSchema` from `node_modules/.pnpm/args-tokens@0.25.0/node_modules/args-tokens/lib/resolver.d.ts` via `plugin`
- `ArgToken`
  - interface `/api-ox/default/interfaces/ArgToken` from `node_modules/.pnpm/args-tokens@0.25.0/node_modules/args-tokens/lib/parser-D95CJBHr.d.ts` via `default`
  - interface `/api-ox/plugin/interfaces/ArgToken` from `node_modules/.pnpm/args-tokens@0.25.0/node_modules/args-tokens/lib/parser-D95CJBHr.d.ts` via `plugin`
- `ArgValues`
  - type `/api-ox/default/type-aliases/ArgValues` from `node_modules/.pnpm/args-tokens@0.25.0/node_modules/args-tokens/lib/resolver.d.ts` via `default`
  - type `/api-ox/definition/type-aliases/ArgValues` from `node_modules/.pnpm/args-tokens@0.25.0/node_modules/args-tokens/lib/resolver.d.ts` via `definition`
  - type `/api-ox/plugin/type-aliases/ArgValues` from `node_modules/.pnpm/args-tokens@0.25.0/node_modules/args-tokens/lib/resolver.d.ts` via `plugin`
- `Awaitable`
  - type `/api-ox/default/type-aliases/Awaitable` from `packages/gunshi/src/types.ts` via `default`
  - type `/api-ox/plugin/type-aliases/Awaitable` from `packages/gunshi/src/types.ts` via `plugin`
- `cli`
  - function `/api-ox/default/functions/cli` from `packages/gunshi/src/cli/builtin.ts` via `default`
  - function `/api-ox/default/functions/cli` from `packages/gunshi/src/cli/builtin.ts` via `default`
  - function `/api-ox/default/functions/cli` from `packages/gunshi/src/cli/builtin.ts` via `default`
  - function `/api-ox/default/functions/cli` from `packages/gunshi/src/cli/builtin.ts` via `default`
  - function `/api-ox/default/functions/cli` from `packages/gunshi/src/cli/builtin.ts` via `default`
  - function `/api-ox/default/functions/cli` from `packages/gunshi/src/cli/builtin.ts` via `default`
- `Command`
  - interface `/api-ox/default/interfaces/Command` from `packages/gunshi/src/types.ts` via `default`
  - interface `/api-ox/definition/interfaces/Command` from `packages/gunshi/src/types.ts` via `definition`
  - interface `/api-ox/plugin/interfaces/Command` from `packages/gunshi/src/types.ts` via `plugin`
- `CommandContext`
  - interface `/api-ox/default/interfaces/CommandContext` from `packages/gunshi/src/types.ts` via `default`
  - interface `/api-ox/plugin/interfaces/CommandContext` from `packages/gunshi/src/types.ts` via `plugin`
- `CommandContextCore`
  - type `/api-ox/default/type-aliases/CommandContextCore` from `packages/gunshi/src/types.ts` via `default`
  - type `/api-ox/plugin/type-aliases/CommandContextCore` from `packages/gunshi/src/types.ts` via `plugin`
- `CommandContextExtension`
  - interface `/api-ox/default/interfaces/CommandContextExtension` from `packages/gunshi/src/types.ts` via `default`
  - interface `/api-ox/plugin/interfaces/CommandContextExtension` from `packages/gunshi/src/types.ts` via `plugin`
- `CommandContextParams`
  - interface `/api-ox/default/interfaces/CommandContextParams` from `packages/gunshi/src/context.ts` via `default`
  - interface `/api-ox/definition/interfaces/CommandContextParams` from `packages/gunshi/src/context.ts` via `definition`
  - interface `/api-ox/context/interfaces/CommandContextParams` from `packages/gunshi/src/context.ts` via `context`
  - interface `/api-ox/plugin/interfaces/CommandContextParams` from `packages/gunshi/src/context.ts` via `plugin`
- `CommandDecorator`
  - type `/api-ox/default/type-aliases/CommandDecorator` from `packages/gunshi/src/types.ts` via `default`
  - type `/api-ox/plugin/type-aliases/CommandDecorator` from `packages/gunshi/src/types.ts` via `plugin`
- `CommandExamplesFetcher`
  - type `/api-ox/default/type-aliases/CommandExamplesFetcher` from `packages/gunshi/src/types.ts` via `default`
  - type `/api-ox/plugin/type-aliases/CommandExamplesFetcher` from `packages/gunshi/src/types.ts` via `plugin`
- `CommandLoader`
  - type `/api-ox/default/type-aliases/CommandLoader` from `packages/gunshi/src/types.ts` via `default`
  - type `/api-ox/definition/type-aliases/CommandLoader` from `packages/gunshi/src/types.ts` via `definition`
- `CommandRunner`
  - type `/api-ox/default/type-aliases/CommandRunner` from `packages/gunshi/src/types.ts` via `default`
  - type `/api-ox/definition/type-aliases/CommandRunner` from `packages/gunshi/src/types.ts` via `definition`
  - type `/api-ox/plugin/type-aliases/CommandRunner` from `packages/gunshi/src/types.ts` via `plugin`
- `createCommandContext`
  - function `/api-ox/default/functions/createCommandContext` from `packages/gunshi/src/context.ts` via `default`
  - function `/api-ox/definition/functions/createCommandContext` from `packages/gunshi/src/context.ts` via `definition`
  - function `/api-ox/context/functions/createCommandContext` from `packages/gunshi/src/context.ts` via `context`
  - function `/api-ox/plugin/functions/createCommandContext` from `packages/gunshi/src/context.ts` via `plugin`
- `DefaultGunshiParams`
  - type `/api-ox/default/type-aliases/DefaultGunshiParams` from `packages/gunshi/src/types.ts` via `default`
  - type `/api-ox/definition/type-aliases/DefaultGunshiParams` from `packages/gunshi/src/types.ts` via `definition`
  - type `/api-ox/plugin/type-aliases/DefaultGunshiParams` from `packages/gunshi/src/types.ts` via `plugin`
- `define`
  - function `/api-ox/default/functions/define` from `packages/gunshi/src/definition.ts` via `default`
  - function `/api-ox/default/functions/define` from `packages/gunshi/src/definition.ts` via `default`
  - function `/api-ox/definition/functions/define` from `packages/gunshi/src/definition.ts` via `definition`
  - function `/api-ox/definition/functions/define` from `packages/gunshi/src/definition.ts` via `definition`
- `defineWithTypes`
  - function `/api-ox/default/functions/defineWithTypes` from `packages/gunshi/src/definition.ts` via `default`
  - function `/api-ox/definition/functions/defineWithTypes` from `packages/gunshi/src/definition.ts` via `definition`
- `ExtendContext`
  - type `/api-ox/default/type-aliases/ExtendContext` from `packages/gunshi/src/types.ts` via `default`
  - type `/api-ox/definition/type-aliases/ExtendContext` from `packages/gunshi/src/types.ts` via `definition`
  - type `/api-ox/plugin/type-aliases/ExtendContext` from `packages/gunshi/src/types.ts` via `plugin`
- `GunshiParams`
  - interface `/api-ox/default/interfaces/GunshiParams` from `packages/gunshi/src/types.ts` via `default`
  - interface `/api-ox/definition/interfaces/GunshiParams` from `packages/gunshi/src/types.ts` via `definition`
  - interface `/api-ox/plugin/interfaces/GunshiParams` from `packages/gunshi/src/types.ts` via `plugin`
- `GunshiParamsConstraint`
  - type `/api-ox/default/type-aliases/GunshiParamsConstraint` from `packages/gunshi/src/types.ts` via `default`
  - type `/api-ox/plugin/type-aliases/GunshiParamsConstraint` from `packages/gunshi/src/types.ts` via `plugin`
- `lazy`
  - function `/api-ox/default/functions/lazy` from `packages/gunshi/src/definition.ts` via `default`
  - function `/api-ox/default/functions/lazy` from `packages/gunshi/src/definition.ts` via `default`
  - function `/api-ox/default/functions/lazy` from `packages/gunshi/src/definition.ts` via `default`
  - function `/api-ox/definition/functions/lazy` from `packages/gunshi/src/definition.ts` via `definition`
  - function `/api-ox/definition/functions/lazy` from `packages/gunshi/src/definition.ts` via `definition`
  - function `/api-ox/definition/functions/lazy` from `packages/gunshi/src/definition.ts` via `definition`
- `LazyCommand`
  - type `/api-ox/default/type-aliases/LazyCommand` from `packages/gunshi/src/types.ts` via `default`
  - type `/api-ox/definition/type-aliases/LazyCommand` from `packages/gunshi/src/types.ts` via `definition`
  - type `/api-ox/plugin/type-aliases/LazyCommand` from `packages/gunshi/src/types.ts` via `plugin`
- `lazyWithTypes`
  - function `/api-ox/default/functions/lazyWithTypes` from `packages/gunshi/src/definition.ts` via `default`
  - function `/api-ox/definition/functions/lazyWithTypes` from `packages/gunshi/src/definition.ts` via `definition`
- `merge`
  - function `/api-ox/combinators/functions/merge` from `node_modules/.pnpm/args-tokens@0.25.0/node_modules/args-tokens/lib/combinators.d.ts` via `combinators`
  - function `/api-ox/combinators/functions/merge` from `node_modules/.pnpm/args-tokens@0.25.0/node_modules/args-tokens/lib/combinators.d.ts` via `combinators`
  - function `/api-ox/combinators/functions/merge` from `node_modules/.pnpm/args-tokens@0.25.0/node_modules/args-tokens/lib/combinators.d.ts` via `combinators`
  - function `/api-ox/combinators/functions/merge` from `node_modules/.pnpm/args-tokens@0.25.0/node_modules/args-tokens/lib/combinators.d.ts` via `combinators`
- `OnPluginExtension`
  - type `/api-ox/default/type-aliases/OnPluginExtension` from `packages/gunshi/src/plugin/core.ts` via `default`
  - type `/api-ox/plugin/type-aliases/OnPluginExtension` from `packages/gunshi/src/plugin/core.ts` via `plugin`
- `plugin`
  - function `/api-ox/default/functions/plugin` from `packages/gunshi/src/plugin/core.ts` via `default`
  - function `/api-ox/default/functions/plugin` from `packages/gunshi/src/plugin/core.ts` via `default`
  - function `/api-ox/default/functions/plugin` from `packages/gunshi/src/plugin/core.ts` via `default`
  - function `/api-ox/plugin/functions/plugin` from `packages/gunshi/src/plugin/core.ts` via `plugin`
  - function `/api-ox/plugin/functions/plugin` from `packages/gunshi/src/plugin/core.ts` via `plugin`
  - function `/api-ox/plugin/functions/plugin` from `packages/gunshi/src/plugin/core.ts` via `plugin`
- `Plugin`
  - type `/api-ox/default/type-aliases/Plugin` from `packages/gunshi/src/plugin/core.ts` via `default`
  - type `/api-ox/plugin/type-aliases/Plugin` from `packages/gunshi/src/plugin/core.ts` via `plugin`
- `PluginContext`
  - interface `/api-ox/default/interfaces/PluginContext` from `packages/gunshi/src/plugin/context.ts` via `default`
  - interface `/api-ox/plugin/interfaces/PluginContext` from `packages/gunshi/src/plugin/context.ts` via `plugin`
- `PluginDependency`
  - interface `/api-ox/default/interfaces/PluginDependency` from `packages/gunshi/src/plugin/core.ts` via `default`
  - interface `/api-ox/plugin/interfaces/PluginDependency` from `packages/gunshi/src/plugin/core.ts` via `plugin`
- `PluginExtension`
  - type `/api-ox/default/type-aliases/PluginExtension` from `packages/gunshi/src/plugin/core.ts` via `default`
  - type `/api-ox/plugin/type-aliases/PluginExtension` from `packages/gunshi/src/plugin/core.ts` via `plugin`
- `PluginFunction`
  - type `/api-ox/default/type-aliases/PluginFunction` from `packages/gunshi/src/plugin/core.ts` via `default`
  - type `/api-ox/plugin/type-aliases/PluginFunction` from `packages/gunshi/src/plugin/core.ts` via `plugin`
- `PluginOptions`
  - interface `/api-ox/default/interfaces/PluginOptions` from `packages/gunshi/src/plugin/core.ts` via `default`
  - interface `/api-ox/plugin/interfaces/PluginOptions` from `packages/gunshi/src/plugin/core.ts` via `plugin`
- `PluginWithExtension`
  - interface `/api-ox/default/interfaces/PluginWithExtension` from `packages/gunshi/src/plugin/core.ts` via `default`
  - interface `/api-ox/plugin/interfaces/PluginWithExtension` from `packages/gunshi/src/plugin/core.ts` via `plugin`
- `PluginWithoutExtension`
  - interface `/api-ox/default/interfaces/PluginWithoutExtension` from `packages/gunshi/src/plugin/core.ts` via `default`
  - interface `/api-ox/plugin/interfaces/PluginWithoutExtension` from `packages/gunshi/src/plugin/core.ts` via `plugin`
- `positional`
  - function `/api-ox/combinators/functions/positional` from `node_modules/.pnpm/args-tokens@0.25.0/node_modules/args-tokens/lib/combinators.d.ts` via `combinators`
  - function `/api-ox/combinators/functions/positional` from `node_modules/.pnpm/args-tokens@0.25.0/node_modules/args-tokens/lib/combinators.d.ts` via `combinators`
- `Prettify`
  - type `/api-ox/default/type-aliases/Prettify` from `packages/gunshi/src/types.ts` via `default`
  - type `/api-ox/plugin/type-aliases/Prettify` from `packages/gunshi/src/types.ts` via `plugin`
- `RendererDecorator`
  - type `/api-ox/default/type-aliases/RendererDecorator` from `packages/gunshi/src/types.ts` via `default`
  - type `/api-ox/plugin/type-aliases/RendererDecorator` from `packages/gunshi/src/types.ts` via `plugin`
- `ValidationErrorsDecorator`
  - type `/api-ox/default/type-aliases/ValidationErrorsDecorator` from `packages/gunshi/src/types.ts` via `default`
  - type `/api-ox/plugin/type-aliases/ValidationErrorsDecorator` from `packages/gunshi/src/types.ts` via `plugin`

## ox-content Output File Collisions

ox-content entrypoint output uses entrypoint file names. A collision here means two entrypoints would write the same Markdown file.

- none

## Generated Files

- `agent/functions/getAgentProfile.md`
- `agent/index.md`
- `combinators/functions/args.md`
- `combinators/functions/boolean.md`
- `combinators/functions/choice.md`
- `combinators/functions/combinator.md`
- `combinators/functions/describe.md`
- `combinators/functions/extend.md`
- `combinators/functions/float.md`
- `combinators/functions/integer.md`
- `combinators/functions/map.md`
- `combinators/functions/merge.md`
- `combinators/functions/multiple.md`
- `combinators/functions/number.md`
- `combinators/functions/positional.md`
- `combinators/functions/required.md`
- `combinators/functions/short.md`
- `combinators/functions/string.md`
- `combinators/functions/unrequired.md`
- `combinators/functions/withDefault.md`
- `combinators/index.md`
- `combinators/interfaces/BaseOptions.md`
- `combinators/interfaces/BooleanOptions.md`
- `combinators/interfaces/CombinatorOptions.md`
- `combinators/interfaces/FloatOptions.md`
- `combinators/interfaces/IntegerOptions.md`
- `combinators/interfaces/NumberOptions.md`
- `combinators/interfaces/StringOptions.md`
- `combinators/type-aliases/Combinator.md`
- `combinators/type-aliases/CombinatorSchema.md`
- `context/functions/createCommandContext.md`
- `context/index.md`
- `context/interfaces/CommandContextParams.md`
- `default/classes/DefaultTranslation.md`
- `default/functions/cli.md`
- `default/functions/createCommandContext.md`
- `default/functions/define.md`
- `default/functions/defineWithTypes.md`
- `default/functions/lazy.md`
- `default/functions/lazyWithTypes.md`
- `default/functions/parseArgs.md`
- `default/functions/plugin.md`
- `default/functions/resolveArgs.md`
- `default/index.md`
- `default/interfaces/ArgSchema.md`
- `default/interfaces/ArgToken.md`
- `default/interfaces/Args.md`
- `default/interfaces/CliOptions.md`
- `default/interfaces/Command.md`
- `default/interfaces/CommandContext.md`
- `default/interfaces/CommandContextExtension.md`
- `default/interfaces/CommandContextParams.md`
- `default/interfaces/CommandEnvironment.md`
- `default/interfaces/GunshiParams.md`
- `default/interfaces/PluginContext.md`
- `default/interfaces/PluginDependency.md`
- `default/interfaces/PluginOptions.md`
- `default/interfaces/PluginWithExtension.md`
- `default/interfaces/PluginWithoutExtension.md`
- `default/interfaces/RenderingOptions.md`
- `default/interfaces/SubCommandable.md`
- `default/type-aliases/ArgValues.md`
- `default/type-aliases/Awaitable.md`
- `default/type-aliases/CommandCallMode.md`
- `default/type-aliases/CommandContextCore.md`
- `default/type-aliases/CommandDecorator.md`
- `default/type-aliases/CommandExamplesFetcher.md`
- `default/type-aliases/CommandLoader.md`
- `default/type-aliases/CommandRunner.md`
- `default/type-aliases/Commandable.md`
- `default/type-aliases/DefaultGunshiParams.md`
- `default/type-aliases/ExtendContext.md`
- `default/type-aliases/GunshiParamsConstraint.md`
- `default/type-aliases/LazyCommand.md`
- `default/type-aliases/OnPluginExtension.md`
- `default/type-aliases/Plugin.md`
- `default/type-aliases/PluginExtension.md`
- `default/type-aliases/PluginFunction.md`
- `default/type-aliases/Prettify.md`
- `default/type-aliases/RendererDecorator.md`
- `default/type-aliases/ValidationErrorsDecorator.md`
- `default/variables/ANONYMOUS_COMMAND_NAME.md`
- `definition/functions/createCommandContext.md`
- `definition/functions/define.md`
- `definition/functions/defineWithTypes.md`
- `definition/functions/lazy.md`
- `definition/functions/lazyWithTypes.md`
- `definition/index.md`
- `definition/interfaces/ArgSchema.md`
- `definition/interfaces/Args.md`
- `definition/interfaces/Command.md`
- `definition/interfaces/CommandContextParams.md`
- `definition/interfaces/GunshiParams.md`
- `definition/type-aliases/ArgValues.md`
- `definition/type-aliases/CommandLoader.md`
- `definition/type-aliases/CommandRunner.md`
- `definition/type-aliases/DefaultGunshiParams.md`
- `definition/type-aliases/ExtendContext.md`
- `definition/type-aliases/LazyCommand.md`
- `docs.json`
- `generator/functions/generate.md`
- `generator/index.md`
- `generator/type-aliases/GenerateOptions.md`
- `index.md`
- `nav.ts`
- `plugin/functions/createCommandContext.md`
- `plugin/functions/plugin.md`
- `plugin/index.md`
- `plugin/interfaces/ArgSchema.md`
- `plugin/interfaces/ArgToken.md`
- `plugin/interfaces/Args.md`
- `plugin/interfaces/Command.md`
- `plugin/interfaces/CommandContext.md`
- `plugin/interfaces/CommandContextExtension.md`
- `plugin/interfaces/CommandContextParams.md`
- `plugin/interfaces/GunshiParams.md`
- `plugin/interfaces/PluginContext.md`
- `plugin/interfaces/PluginDependency.md`
- `plugin/interfaces/PluginOptions.md`
- `plugin/interfaces/PluginWithExtension.md`
- `plugin/interfaces/PluginWithoutExtension.md`
- `plugin/type-aliases/ArgValues.md`
- `plugin/type-aliases/Awaitable.md`
- `plugin/type-aliases/CommandContextCore.md`
- `plugin/type-aliases/CommandDecorator.md`
- `plugin/type-aliases/CommandExamplesFetcher.md`
- `plugin/type-aliases/CommandRunner.md`
- `plugin/type-aliases/DefaultGunshiParams.md`
- `plugin/type-aliases/ExtendContext.md`
- `plugin/type-aliases/GunshiParamsConstraint.md`
- `plugin/type-aliases/LazyCommand.md`
- `plugin/type-aliases/OnPluginExtension.md`
- `plugin/type-aliases/Plugin.md`
- `plugin/type-aliases/PluginExtension.md`
- `plugin/type-aliases/PluginFunction.md`
- `plugin/type-aliases/Prettify.md`
- `plugin/type-aliases/RendererDecorator.md`
- `plugin/type-aliases/ValidationErrorsDecorator.md`
- `plugin/variables/ANONYMOUS_COMMAND_NAME.md`
- `plugin/variables/CLI_OPTIONS_DEFAULT.md`
- `renderer/functions/renderHeader.md`
- `renderer/functions/renderUsage.md`
- `renderer/functions/renderValidationErrors.md`
- `renderer/index.md`

## Migration Notes

- This comparison uses `@ox-content/napi` with `pathStrategy: "typedoc"`, so each symbol is emitted as its own nested page (`{module}/{category}/{Name}.md`) matching TypeDoc's `/api/default/functions/cli` layout, with a per-module `index.md`.
- Navigation is generated via `generateDocsNavMetadataFromDocs(..., { pathStrategy: "typedoc" })`, producing a deep `module -> category -> symbol` sidebar tree (`NavItem.children`) instead of the previous flat entrypoint list.
- `linkStyle: "markdown"` is used so VitePress' dead-link checker resolves the generated links; with `cleanUrls: true` they are still served as clean URLs at runtime.
- `externalDocs: true` (with `externalPackageSources` overrides) resolves external package re-exports into documentation entries, so `args-tokens` (`parseArgs`, `resolveArgs`, combinators, `kebabnize`), `@gunshi/plugin-renderer` (`renderHeader`, `renderUsage`, `renderValidationErrors`) and `@gunshi/plugin-i18n` (`DefaultTranslation`) now appear as docs entries. This brings missing-by-name down to 0.
- `{@link}` / `{@linkcode}` inline tags are resolved by the renderer: known symbols become internal links (e.g. `{@linkcode Command | entry command}` -> a link to the `Command` page), and unresolvable symbols (not part of gunshi's public API, e.g. `TranslationAdapter`) fall back to inline code. No raw `{@link}` tags remain in the generated pages.
- Overloads are unified into a single page/anchor per symbol (`cli`, `define`, `lazy`, `plugin`), so duplicate anchors are gone. The "Symbol entries" count above still counts overloads and cross-entrypoint re-exports separately, but each `{module}/{category}/{Name}.md` page is unique.
- Members are exposed/rendered for documented class/interface/type/enum entries, so pages such as `Command` include member data; `enum` symbols now get `enumerations/{Name}` pages.
- `internal: false` is passed to entrypoint extraction to match TypeDoc `--excludeInternal`.
- Remaining differences: symbol duplication across entrypoints (`Command` appears under `default`, `definition`, `plugin` — the same multi-module re-export behavior TypeDoc has); and the `<details>` / `<div>` based card layout, which differs from TypeDoc's table/breadcrumb layout. Raw ox-content Markdown still uses HTML `<details>` and `<pre><code>` blocks; this output minimally postprocesses them with `v-pre` and code-block brace/newline escaping so VitePress/Vue does not parse API signatures as template HTML.
