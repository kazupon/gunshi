# ox-content API docs comparison

Generated at: 2026-06-04T02:09:22.317Z

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
- ox-content npm package: `@ox-content/napi@2.49.0`
- ox-content package path: `node_modules/.pnpm/@ox-content+napi@2.49.0/node_modules/@ox-content/napi/package.json`
- export graph entrypoints: 8
- export graph source modules: 20
- render style: `renderStyle: "markdown"` emits pure native Markdown (fenced code blocks, tables, Markdown links) with no raw HTML; this script only normalizes generic angle brackets in headings for VitePress/Vue compatibility.
- display formats: `indexFormat`, `parametersFormat`, property/member formats, and `enumMembersFormat` are set to `"table"` to mirror the current TypeDoc configuration; `typeDeclarationFormat` is left as `"none"` because the TypeDoc config does not set it.
- stats summaries: `renderStats: false` omits ox-content's `_N symbols · ..._` summary lines for TypeDoc-like output.
- group order: `groupOrder: ["Variables","Functions","Class"]` mirrors `packages/docs/typedoc.config.mjs` for module index and nav group order.

## Summary

| Metric                                       | Current TypeDoc | ox-content (typedoc) |
| -------------------------------------------- | --------------: | -------------------: |
| Symbol entries                               |              82 |                  152 |
| Unique symbol names                          |              82 |                   82 |
| Markdown pages                               |              91 |                   91 |
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

| Symbol                   | Current TypeDoc URL                                | ox-content typedoc URL                             |
| ------------------------ | -------------------------------------------------- | -------------------------------------------------- |
| `cli`                    | `/api/default/functions/cli.md`                    | `/api-ox/default/functions/cli`                    |
| `define`                 | `/api/definition/functions/define.md`              | `/api-ox/definition/functions/define`              |
| `Command`                | `/api/default/interfaces/Command.md`               | `/api-ox/default/interfaces/Command`               |
| `Plugin`                 | `/api/default/type-aliases/Plugin.md`              | `/api-ox/default/type-aliases/Plugin`              |
| `DefaultTranslation`     | `/api/default/classes/DefaultTranslation.md`       | `/api-ox/default/classes/DefaultTranslation`       |
| `ANONYMOUS_COMMAND_NAME` | `/api/default/variables/ANONYMOUS_COMMAND_NAME.md` | `/api-ox/default/variables/ANONYMOUS_COMMAND_NAME` |
| `CLI_OPTIONS_DEFAULT`    | `/api/plugin/variables/CLI_OPTIONS_DEFAULT.md`     | `/api-ox/plugin/variables/CLI_OPTIONS_DEFAULT`     |
| `string`                 | `/api/combinators/functions/string.md`             | `/api-ox/combinators/functions/string`             |

## Missing Current TypeDoc Symbols

These symbols exist in current TypeDoc pages but were not present by symbol name in ox-content entrypoint extraction.

- none

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
  - interface `/api-ox/default/interfaces/Args` from ``via`default`
  - interface `/api-ox/definition/interfaces/Args` from ``via`definition`
  - interface `/api-ox/plugin/interfaces/Args` from ``via`plugin`
- `ArgSchema`
  - interface `/api-ox/default/interfaces/ArgSchema` from ``via`default`
  - interface `/api-ox/definition/interfaces/ArgSchema` from ``via`definition`
  - interface `/api-ox/plugin/interfaces/ArgSchema` from ``via`plugin`
- `ArgToken`
  - interface `/api-ox/default/interfaces/ArgToken` from ``via`default`
  - interface `/api-ox/plugin/interfaces/ArgToken` from ``via`plugin`
- `ArgValues`
  - type `/api-ox/default/type-aliases/ArgValues` from ``via`default`
  - type `/api-ox/definition/type-aliases/ArgValues` from ``via`definition`
  - type `/api-ox/plugin/type-aliases/ArgValues` from ``via`plugin`
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
  - function `/api-ox/combinators/functions/merge` from ``via`combinators`
  - function `/api-ox/combinators/functions/merge` from ``via`combinators`
  - function `/api-ox/combinators/functions/merge` from ``via`combinators`
  - function `/api-ox/combinators/functions/merge` from ``via`combinators`
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
  - function `/api-ox/combinators/functions/positional` from ``via`combinators`
  - function `/api-ox/combinators/functions/positional` from ``via`combinators`
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
- `definition/functions/define.md`
- `definition/functions/defineWithTypes.md`
- `definition/functions/lazy.md`
- `definition/functions/lazyWithTypes.md`
- `definition/index.md`
- `docs.json`
- `generator/functions/generate.md`
- `generator/index.md`
- `generator/type-aliases/GenerateOptions.md`
- `index.md`
- `nav.ts`
- `plugin/index.md`
- `plugin/variables/CLI_OPTIONS_DEFAULT.md`
- `renderer/functions/renderHeader.md`
- `renderer/functions/renderUsage.md`
- `renderer/functions/renderValidationErrors.md`
- `renderer/index.md`

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
- v2.49.0 links known symbols inside type annotations, so Type Parameter constraints/defaults and Type cells can navigate to matching API pages like TypeDoc. Remaining caveat: primitive names that collide with public API exports (for example `string` / `boolean` combinators) can be over-linked.
- `externalDocs: true` (with `externalPackageSources` overrides) resolves external package re-exports into documentation entries, so `args-tokens` (`parseArgs`, `resolveArgs`, combinators, `kebabnize`), `@gunshi/plugin-renderer` (`renderHeader`, `renderUsage`, `renderValidationErrors`) and `@gunshi/plugin-i18n` (`DefaultTranslation`) now appear as docs entries. This brings missing-by-name down to 0.
- `{@link}` / `{@linkcode}` inline tags are resolved by the renderer: known symbols become internal links (e.g. `{@linkcode Command | entry command}` -> a link to the `Command` page), and unresolvable symbols (not part of gunshi's public API, e.g. `TranslationAdapter`) fall back to inline code. No raw `{@link}` tags remain in the generated pages.
- Overloads are unified into a single page/anchor per symbol (`cli`, `define`, `lazy`, `plugin`) and v2.45.0 renders each public overload as a call signature instead of letting the implementation `any` signature overwrite the page. The "Symbol entries" count above still counts overloads and cross-entrypoint re-exports separately, but each `{module}/{category}/{Name}.md` page is unique.
- Members are exposed/rendered for documented class/interface/type/enum entries, so pages such as `Command` include member data; `enum` symbols now get `enumerations/{Name}` pages.
- `internal: false` is passed to entrypoint extraction to match TypeDoc `--excludeInternal`.
- `renderStyle: "markdown"` (ox-content v2.29.0+) emits pure native Markdown — tables for params/members, fenced code blocks for signatures/examples, and Markdown links — with no raw HTML. This makes every inline `{@link}` / `{@linkcode}` a Markdown link that VitePress transforms to a clean URL and dead-link-checks (fixing the broken raw-HTML `.md` links), and removes the need for the previous `v-pre` / brace-escaping postprocess. The only remaining local normalization is escaping generic angle brackets in headings (e.g. `Command\<G\>`) so Vue does not parse them as HTML.
- Remaining differences are limited to module-index framing details tracked in .notes/035: breadcrumb and module Source link.
