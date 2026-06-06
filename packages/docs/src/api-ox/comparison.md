# ox-content API docs comparison

Generated at: 2026-06-06T11:48:41.965Z

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
- ox-content npm package: `@ox-content/napi@2.59.0`
- ox-content package path: `node_modules/.pnpm/@ox-content+napi@2.59.0/node_modules/@ox-content/napi/package.json`
- export graph entrypoints: 8
- export graph source modules: 20
- render style: `renderStyle: "markdown"` emits pure native Markdown (fenced code blocks, tables, Markdown links) with no raw HTML; this script only normalizes generic angle brackets in headings for VitePress/Vue compatibility.
- display formats: `indexFormat`, `parametersFormat`, property/member formats, and `enumMembersFormat` are set to `"table"` to mirror the current TypeDoc configuration; `typeDeclarationFormat` is left as `"none"` because the TypeDoc config does not set it.
- stats summaries: `renderStats: false` omits ox-content's `_N symbols · ..._` summary lines for TypeDoc-like output.
- generated-by attribution: `renderGeneratedBy: false` omits ox-content's root attribution line for TypeDoc-like output.
- group order: `groupOrder: ["Variables","Functions","Class"]` mirrors `packages/docs/typedoc.config.mjs` for module index and nav group order.
- organization sort: `sort: ["alphabetical"]` and `sortEntryPoints: true` are passed to both Markdown and nav generation so page order and sidebar order stay aligned. `kindSortOrder` is intentionally unset because the current TypeDoc config does not set it.

## Summary

| Metric                                       | Current TypeDoc | ox-content (typedoc) |
| -------------------------------------------- | --------------: | -------------------: |
| Symbol entries                               |              82 |                  152 |
| Unique symbol names                          |              82 |                    0 |
| Markdown pages                               |              91 |                    9 |
| Missing TypeDoc symbols by name              |               - |                   82 |
| Extra ox-content symbols by name             |               - |                    0 |
| Public exports without extracted docs        |               - |                   10 |
| Rendered member entries                      |               - |                  309 |
| ox-content extraction diagnostics            |               - |                   10 |
| ox-content output file collisions            |               - |                    0 |
| ox-content `@internal` entries still emitted |               - |                    0 |

Current TypeDoc kind counts: class: 1, function: 32, interface: 24, type: 23, variable: 2

ox-content kind counts: class: 1, function: 59, interface: 43, type: 46, variable: 3

## URL Samples

| Symbol                   | Current TypeDoc URL                                | ox-content typedoc URL |
| ------------------------ | -------------------------------------------------- | ---------------------- |
| `cli`                    | `/api/default/functions/cli.md`                    | -                      |
| `define`                 | `/api/definition/functions/define.md`              | -                      |
| `Command`                | `/api/default/interfaces/Command.md`               | -                      |
| `Plugin`                 | `/api/default/type-aliases/Plugin.md`              | -                      |
| `DefaultTranslation`     | `/api/default/classes/DefaultTranslation.md`       | -                      |
| `ANONYMOUS_COMMAND_NAME` | `/api/default/variables/ANONYMOUS_COMMAND_NAME.md` | -                      |
| `CLI_OPTIONS_DEFAULT`    | `/api/plugin/variables/CLI_OPTIONS_DEFAULT.md`     | -                      |
| `string`                 | `/api/combinators/functions/string.md`             | -                      |

## Missing Current TypeDoc Symbols

These symbols exist in current TypeDoc pages but were not present by symbol name in ox-content entrypoint extraction.

- `ANONYMOUS_COMMAND_NAME` (variable) - `/api/default/variables/ANONYMOUS_COMMAND_NAME.md`
- `args` (function) - `/api/combinators/functions/args.md`
- `Args` (interface) - `/api/default/interfaces/Args.md`
- `ArgSchema` (interface) - `/api/default/interfaces/ArgSchema.md`
- `ArgToken` (interface) - `/api/default/interfaces/ArgToken.md`
- `ArgValues` (type) - `/api/default/type-aliases/ArgValues.md`
- `Awaitable` (type) - `/api/default/type-aliases/Awaitable.md`
- `BaseOptions` (interface) - `/api/combinators/interfaces/BaseOptions.md`
- `boolean` (function) - `/api/combinators/functions/boolean.md`
- `BooleanOptions` (interface) - `/api/combinators/interfaces/BooleanOptions.md`
- `choice` (function) - `/api/combinators/functions/choice.md`
- `CLI_OPTIONS_DEFAULT` (variable) - `/api/plugin/variables/CLI_OPTIONS_DEFAULT.md`
- `cli` (function) - `/api/default/functions/cli.md`
- `CliOptions` (interface) - `/api/default/interfaces/CliOptions.md`
- `combinator` (function) - `/api/combinators/functions/combinator.md`
- `Combinator` (type) - `/api/combinators/type-aliases/Combinator.md`
- `CombinatorOptions` (interface) - `/api/combinators/interfaces/CombinatorOptions.md`
- `CombinatorSchema` (type) - `/api/combinators/type-aliases/CombinatorSchema.md`
- `Command` (interface) - `/api/default/interfaces/Command.md`
- `Commandable` (type) - `/api/default/type-aliases/Commandable.md`
- `CommandCallMode` (type) - `/api/default/type-aliases/CommandCallMode.md`
- `CommandContext` (interface) - `/api/default/interfaces/CommandContext.md`
- `CommandContextCore` (type) - `/api/default/type-aliases/CommandContextCore.md`
- `CommandContextExtension` (interface) - `/api/default/interfaces/CommandContextExtension.md`
- `CommandContextParams` (interface) - `/api/context/interfaces/CommandContextParams.md`
- `CommandDecorator` (type) - `/api/default/type-aliases/CommandDecorator.md`
- `CommandEnvironment` (interface) - `/api/default/interfaces/CommandEnvironment.md`
- `CommandExamplesFetcher` (type) - `/api/default/type-aliases/CommandExamplesFetcher.md`
- `CommandLoader` (type) - `/api/default/type-aliases/CommandLoader.md`
- `CommandRunner` (type) - `/api/default/type-aliases/CommandRunner.md`
- `createCommandContext` (function) - `/api/context/functions/createCommandContext.md`
- `DefaultGunshiParams` (type) - `/api/default/type-aliases/DefaultGunshiParams.md`
- `DefaultTranslation` (class) - `/api/default/classes/DefaultTranslation.md`
- `define` (function) - `/api/definition/functions/define.md`
- `defineWithTypes` (function) - `/api/definition/functions/defineWithTypes.md`
- `describe` (function) - `/api/combinators/functions/describe.md`
- `extend` (function) - `/api/combinators/functions/extend.md`
- `ExtendContext` (type) - `/api/default/type-aliases/ExtendContext.md`
- `float` (function) - `/api/combinators/functions/float.md`
- `FloatOptions` (interface) - `/api/combinators/interfaces/FloatOptions.md`
- `generate` (function) - `/api/generator/functions/generate.md`
- `GenerateOptions` (type) - `/api/generator/type-aliases/GenerateOptions.md`
- `getAgentProfile` (function) - `/api/agent/functions/getAgentProfile.md`
- `GunshiParams` (interface) - `/api/default/interfaces/GunshiParams.md`
- `GunshiParamsConstraint` (type) - `/api/default/type-aliases/GunshiParamsConstraint.md`
- `integer` (function) - `/api/combinators/functions/integer.md`
- `IntegerOptions` (interface) - `/api/combinators/interfaces/IntegerOptions.md`
- `lazy` (function) - `/api/definition/functions/lazy.md`
- `LazyCommand` (type) - `/api/default/type-aliases/LazyCommand.md`
- `lazyWithTypes` (function) - `/api/definition/functions/lazyWithTypes.md`
- `map` (function) - `/api/combinators/functions/map.md`
- `merge` (function) - `/api/combinators/functions/merge.md`
- `multiple` (function) - `/api/combinators/functions/multiple.md`
- `number` (function) - `/api/combinators/functions/number.md`
- `NumberOptions` (interface) - `/api/combinators/interfaces/NumberOptions.md`
- `OnPluginExtension` (type) - `/api/default/type-aliases/OnPluginExtension.md`
- `parseArgs` (function) - `/api/default/functions/parseArgs.md`
- `plugin` (function) - `/api/default/functions/plugin.md`
- `Plugin` (type) - `/api/default/type-aliases/Plugin.md`
- `PluginContext` (interface) - `/api/default/interfaces/PluginContext.md`
- `PluginDependency` (interface) - `/api/default/interfaces/PluginDependency.md`
- `PluginExtension` (type) - `/api/default/type-aliases/PluginExtension.md`
- `PluginFunction` (type) - `/api/default/type-aliases/PluginFunction.md`
- `PluginOptions` (interface) - `/api/default/interfaces/PluginOptions.md`
- `PluginWithExtension` (interface) - `/api/default/interfaces/PluginWithExtension.md`
- `PluginWithoutExtension` (interface) - `/api/default/interfaces/PluginWithoutExtension.md`
- `positional` (function) - `/api/combinators/functions/positional.md`
- `Prettify` (type) - `/api/default/type-aliases/Prettify.md`
- `RendererDecorator` (type) - `/api/default/type-aliases/RendererDecorator.md`
- `renderHeader` (function) - `/api/renderer/functions/renderHeader.md`
- `RenderingOptions` (interface) - `/api/default/interfaces/RenderingOptions.md`
- `renderUsage` (function) - `/api/renderer/functions/renderUsage.md`
- `renderValidationErrors` (function) - `/api/renderer/functions/renderValidationErrors.md`
- `required` (function) - `/api/combinators/functions/required.md`
- `resolveArgs` (function) - `/api/default/functions/resolveArgs.md`
- `short` (function) - `/api/combinators/functions/short.md`
- `string` (function) - `/api/combinators/functions/string.md`
- `StringOptions` (interface) - `/api/combinators/interfaces/StringOptions.md`
- `SubCommandable` (interface) - `/api/default/interfaces/SubCommandable.md`
- `unrequired` (function) - `/api/combinators/functions/unrequired.md`
- `ValidationErrorsDecorator` (type) - `/api/default/type-aliases/ValidationErrorsDecorator.md`
- `withDefault` (function) - `/api/combinators/functions/withDefault.md`

## Extra ox-content Symbols

These generated ox-content symbol pages do not have a current TypeDoc symbol page by the same name.

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
  - interface `/api-ox/default/interfaces/Args` via `default`
  - interface `/api-ox/definition/interfaces/Args` via `definition`
  - interface `/api-ox/plugin/interfaces/Args` via `plugin`
- `ArgSchema`
  - interface `/api-ox/default/interfaces/ArgSchema` via `default`
  - interface `/api-ox/definition/interfaces/ArgSchema` via `definition`
  - interface `/api-ox/plugin/interfaces/ArgSchema` via `plugin`
- `ArgToken`
  - interface `/api-ox/default/interfaces/ArgToken` via `default`
  - interface `/api-ox/plugin/interfaces/ArgToken` via `plugin`
- `ArgValues`
  - type `/api-ox/default/type-aliases/ArgValues` via `default`
  - type `/api-ox/definition/type-aliases/ArgValues` via `definition`
  - type `/api-ox/plugin/type-aliases/ArgValues` via `plugin`
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
  - function `/api-ox/combinators/functions/merge` via `combinators`
  - function `/api-ox/combinators/functions/merge` via `combinators`
  - function `/api-ox/combinators/functions/merge` via `combinators`
  - function `/api-ox/combinators/functions/merge` via `combinators`
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
  - function `/api-ox/combinators/functions/positional` via `combinators`
  - function `/api-ox/combinators/functions/positional` via `combinators`
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

- `agent.md`
- `combinators.md`
- `context.md`
- `default.md`
- `definition.md`
- `docs.json`
- `generator.md`
- `index.md`
- `nav.ts`
- `plugin.md`
- `renderer.md`

## Migration Notes

- This comparison uses `@ox-content/napi` with `pathStrategy: "typedoc"`, so each symbol is emitted as its own nested page (`{module}/{category}/{Name}.md`) matching TypeDoc's `/api/default/functions/cli` layout, with a per-module `index.md`.
- Navigation is generated via `generateDocsNavMetadataFromDocs(..., { pathStrategy: "typedoc" })`, producing a deep `module -> category -> symbol` tree. ox-content's nav is framework-agnostic (`{ title, path, children }`), so this script only normalizes it to the VitePress sidebar shape (`{ text, link, items }`) on the consumer side (see .notes/029): module nodes link to their index, category nodes are link-less collapsible headers (no category index page exists, matching TypeDoc), and leaf symbol nodes link to their per-symbol pages. Leaf symbol dedupe and alphabetical ordering are handled upstream by ox-content v2.47.0+.
- `linkStyle: "markdown"` is used so VitePress' dead-link checker resolves the generated links; with `cleanUrls: true` they are still served as clean URLs at runtime.
- v2.40.0 display format options are used to render module indexes, parameters, properties, type-alias properties, and enum members as tables, matching the active `typedoc-plugin-markdown` settings.
- v2.42.0 module-level examples are passed through and rendered on module index pages such as `combinators/index.md`.
- v2.43.0 renders `@experimental` / `@deprecated` as GitHub Alert blocks and includes the declaration kind in TypeDoc-style symbol H1 titles.
- v2.44.0 renders `@since` / `@version` as `## Since` sections instead of generic tags, and this script passes `sourcePath` through so the TypeDoc path strategy has the canonical source metadata available.
- v2.45.0 renders all overload call signatures on typedoc symbol pages; this script carries `hasBody` through so implementation signatures can be omitted when public overloads exist.
- v2.45.0 `renderStats: false` is used so root/module indexes no longer emit ox-content stats summary lines.
- v2.46.0 `groupOrder` is used for both Markdown and nav generation so module index sections and sidebar groups follow the current TypeDoc ordering.
- v2.47.0 sorts/dedupes TypeDoc nav leaf entries and sorts class/interface/type members alphabetically, so this script no longer postprocesses nav leaves or member order.
- v2.48.0 omits the redundant `Kind` column from named member tables, bringing interface/class/type member tables closer to TypeDoc output.
- v2.49.0 links known symbols inside type annotations, so Type Parameter constraints/defaults and Type cells can navigate to matching API pages like TypeDoc.
- v2.50.0 preserves TypeScript primitive/global names such as `string` and `boolean` as code in type annotations, avoiding false links to same-named public API symbols.
- v2.51.0 exposes TypeDoc-compatible `sort`, `sortEntryPoints`, and `kindSortOrder` organization options. This script passes the same sort inputs to Markdown and nav generation so sidebar ordering does not diverge from page ordering.
- v2.51.0 uses the entry source path for TypeDoc-strategy module index source links, so module `**[Source]**` links point at the real entry file instead of the module name.
- v2.52.0 through v2.54.0 are release/version updates for the docs NAPI relative to v2.51.0; this generated output is pinned to the latest `@ox-content/napi@2.59.0`.
- v2.55.0 fixes the remaining TypeDoc-parity rendering gaps for this migration pass: mixed Markdown `@example` bodies, multiline type parameter cells, return type literal members, class method details, interface index signatures, function-valued property types, and function type alias parameter/return metadata.
- v2.56.0 fixes return union pipe escaping in top-level `Returns`, expands object literal function parameters (including nested `options.*` rows), and renders member-level type parameters for generic interface/class methods.
- v2.57.0 suppresses non-function property `Returns` sections for description-only `@returns`, merges destructured parameter docs into their parent parameters, and resolves callable metadata for intersection type aliases.
- v2.59.0 omits empty Type Parameter description columns, strips raw JSDoc text from type alias signatures, avoids duplicate function-valued property Returns content, and adds `renderGeneratedBy: false` so the root attribution line can be removed without postprocessing.
- `externalDocs: true` (with `externalPackageSources` overrides) resolves external package re-exports into documentation entries, so `args-tokens` (`parseArgs`, `resolveArgs`, combinators, `kebabnize`), `@gunshi/plugin-renderer` (`renderHeader`, `renderUsage`, `renderValidationErrors`) and `@gunshi/plugin-i18n` (`DefaultTranslation`) now appear as docs entries. This brings missing-by-name down to 0.
- `{@link}` / `{@linkcode}` inline tags are resolved by the renderer: known symbols become internal links (e.g. `{@linkcode Command | entry command}` -> a link to the `Command` page), and unresolvable symbols (not part of gunshi's public API, e.g. `TranslationAdapter`) fall back to inline code. No raw `{@link}` tags remain in the generated pages.
- Overloads are unified into a single page/anchor per symbol (`cli`, `define`, `lazy`, `plugin`) and v2.45.0 renders each public overload as a call signature instead of letting the implementation `any` signature overwrite the page. The "Symbol entries" count above still counts overloads and cross-entrypoint re-exports separately, but each `{module}/{category}/{Name}.md` page is unique.
- Members are exposed/rendered for documented class/interface/type/enum entries, so pages such as `Command` include member data; `enum` symbols now get `enumerations/{Name}` pages.
- `internal: false` is passed to entrypoint extraction to match TypeDoc `--excludeInternal`.
- `renderStyle: "markdown"` (ox-content v2.29.0+) emits pure native Markdown — tables for params/members, fenced code blocks for signatures/examples, and Markdown links — with no raw HTML. This makes every inline `{@link}` / `{@linkcode}` a Markdown link that VitePress transforms to a clean URL and dead-link-checks (fixing the broken raw-HTML `.md` links), and removes the need for the previous `v-pre` / brace-escaping postprocess. The only remaining local normalization is escaping generic angle brackets in headings (e.g. `Command\<G\>`) so Vue does not parse them as HTML.
- Remaining differences are limited to the module-index breadcrumb tracked in .notes/035.
