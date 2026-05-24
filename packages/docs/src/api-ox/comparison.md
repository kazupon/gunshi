# ox-content API docs comparison

Generated at: 2026-05-24T14:08:50.281Z

## Inputs

- Current TypeDoc output: `packages/docs/src/api`
- ox-content output: `packages/docs/src/api-ox`
- gunshi source scan: `packages/gunshi/src`
- ox-content npm package: `@ox-content/napi@2.13.0`
- ox-content package path: `node_modules/.pnpm/@ox-content+napi@2.13.0/node_modules/@ox-content/napi/package.json`
- include: `**/*.ts`
- exclude: `**/*.test.*`, `**/*.snap`, `**/__snapshots__/**`, `**/node_modules/**`, `node_modules`
- postprocess: generated `<details>` blocks and `<pre><code>` blocks are written with `v-pre`, and braces/newlines inside raw HTML code blocks are entity-escaped, so VitePress/Vue does not parse API signatures and code examples as template HTML.

## Summary

| Metric                                       | Current TypeDoc | ox-content direct |
| -------------------------------------------- | --------------: | ----------------: |
| Symbol entries                               |              82 |                88 |
| Unique symbol names                          |              82 |                74 |
| Markdown pages                               |              91 |                13 |
| Missing TypeDoc symbols by name              |               - |                39 |
| Extra ox-content symbols by name             |               - |                31 |
| ox-content output file collisions            |               - |                 2 |
| ox-content `@internal` entries still emitted |               - |                19 |

Current TypeDoc kind counts: class: 1, function: 32, interface: 24, type: 23, variable: 2

ox-content kind counts: function: 34, interface: 16, type: 38

## URL Samples

| Symbol                   | Current TypeDoc URL                                | ox-content direct URL                                                                                                                                                                                                                                                    |
| ------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `cli`                    | `/api/default/functions/cli.md`                    | `/api-ox/bone.md#cli`<br>`/api-ox/bone.md#cli`<br>`/api-ox/bone.md#cli`<br>`/api-ox/bone.md#cli`<br>`/api-ox/builtin.md#cli`<br>`/api-ox/builtin.md#cli`<br>`/api-ox/builtin.md#cli`<br>`/api-ox/builtin.md#cli`<br>`/api-ox/builtin.md#cli`<br>`/api-ox/builtin.md#cli` |
| `define`                 | `/api/definition/functions/define.md`              | `/api-ox/definition.md#define`<br>`/api-ox/definition.md#define`                                                                                                                                                                                                         |
| `Command`                | `/api/default/interfaces/Command.md`               | `/api-ox/types.md#command`                                                                                                                                                                                                                                               |
| `Plugin`                 | `/api/default/type-aliases/Plugin.md`              | `/api-ox/core.md#plugin`                                                                                                                                                                                                                                                 |
| `DefaultTranslation`     | `/api/default/classes/DefaultTranslation.md`       | -                                                                                                                                                                                                                                                                        |
| `ANONYMOUS_COMMAND_NAME` | `/api/default/variables/ANONYMOUS_COMMAND_NAME.md` | -                                                                                                                                                                                                                                                                        |
| `CLI_OPTIONS_DEFAULT`    | `/api/plugin/variables/CLI_OPTIONS_DEFAULT.md`     | -                                                                                                                                                                                                                                                                        |
| `string`                 | `/api/combinators/functions/string.md`             | -                                                                                                                                                                                                                                                                        |

## Missing Current TypeDoc Symbols

These symbols exist in current TypeDoc pages but were not present by symbol name in direct ox-content extraction.

- `ANONYMOUS_COMMAND_NAME` (variable) - `/api/default/variables/ANONYMOUS_COMMAND_NAME.md`
- `args` (function) - `/api/combinators/functions/args.md`
- `Args` (interface) - `/api/default/interfaces/Args.md`
- `ArgSchema` (interface) - `/api/default/interfaces/ArgSchema.md`
- `ArgToken` (interface) - `/api/default/interfaces/ArgToken.md`
- `ArgValues` (type) - `/api/default/type-aliases/ArgValues.md`
- `BaseOptions` (interface) - `/api/combinators/interfaces/BaseOptions.md`
- `boolean` (function) - `/api/combinators/functions/boolean.md`
- `BooleanOptions` (interface) - `/api/combinators/interfaces/BooleanOptions.md`
- `choice` (function) - `/api/combinators/functions/choice.md`
- `CLI_OPTIONS_DEFAULT` (variable) - `/api/plugin/variables/CLI_OPTIONS_DEFAULT.md`
- `combinator` (function) - `/api/combinators/functions/combinator.md`
- `Combinator` (type) - `/api/combinators/type-aliases/Combinator.md`
- `CombinatorOptions` (interface) - `/api/combinators/interfaces/CombinatorOptions.md`
- `CombinatorSchema` (type) - `/api/combinators/type-aliases/CombinatorSchema.md`
- `DefaultTranslation` (class) - `/api/default/classes/DefaultTranslation.md`
- `describe` (function) - `/api/combinators/functions/describe.md`
- `extend` (function) - `/api/combinators/functions/extend.md`
- `float` (function) - `/api/combinators/functions/float.md`
- `FloatOptions` (interface) - `/api/combinators/interfaces/FloatOptions.md`
- `integer` (function) - `/api/combinators/functions/integer.md`
- `IntegerOptions` (interface) - `/api/combinators/interfaces/IntegerOptions.md`
- `map` (function) - `/api/combinators/functions/map.md`
- `merge` (function) - `/api/combinators/functions/merge.md`
- `multiple` (function) - `/api/combinators/functions/multiple.md`
- `number` (function) - `/api/combinators/functions/number.md`
- `NumberOptions` (interface) - `/api/combinators/interfaces/NumberOptions.md`
- `parseArgs` (function) - `/api/default/functions/parseArgs.md`
- `positional` (function) - `/api/combinators/functions/positional.md`
- `renderHeader` (function) - `/api/renderer/functions/renderHeader.md`
- `renderUsage` (function) - `/api/renderer/functions/renderUsage.md`
- `renderValidationErrors` (function) - `/api/renderer/functions/renderValidationErrors.md`
- `required` (function) - `/api/combinators/functions/required.md`
- `resolveArgs` (function) - `/api/default/functions/resolveArgs.md`
- `short` (function) - `/api/combinators/functions/short.md`
- `string` (function) - `/api/combinators/functions/string.md`
- `StringOptions` (interface) - `/api/combinators/interfaces/StringOptions.md`
- `unrequired` (function) - `/api/combinators/functions/unrequired.md`
- `withDefault` (function) - `/api/combinators/functions/withDefault.md`

## Extra ox-content Symbols

These symbols appear in direct ox-content extraction but do not have a current TypeDoc symbol page by the same name.

- `AgentProfile` (interface) - `/api-ox/agent.md#agentprofile` from `packages/gunshi/src/agent.ts`
- `cliCore` (function) - `/api-ox/core.md#clicore` from `packages/gunshi/src/cli/core.ts`
- `NOOP` (function) - `/api-ox/constants.md#noop` from `packages/gunshi/src/constants.ts`
- `ExtractExtensionValues` (type) - `/api-ox/context.md#extractextensionvalues` from `packages/gunshi/src/context.ts`
- `CommandContextResult` (type) - `/api-ox/context.md#commandcontextresult` from `packages/gunshi/src/context.ts`
- `Decorators` (interface) - `/api-ox/decorators.md#decorators` from `packages/gunshi/src/decorators.ts`
- `createDecorators` (function) - `/api-ox/decorators.md#createdecorators` from `packages/gunshi/src/decorators.ts`
- `CommandDefinitionResult` (type) - `/api-ox/definition.md#commanddefinitionresult` from `packages/gunshi/src/definition.ts`
- `CommandDefinition` (type) - `/api-ox/definition.md#commanddefinition` from `packages/gunshi/src/definition.ts`
- `DefineWithTypesReturn` (type) - `/api-ox/definition.md#definewithtypesreturn` from `packages/gunshi/src/definition.ts`
- `LazyWithTypesReturn` (type) - `/api-ox/definition.md#lazywithtypesreturn` from `packages/gunshi/src/definition.ts`
- `createPluginContext` (function) - `/api-ox/context.md#createplugincontext` from `packages/gunshi/src/plugin/context.ts`
- `ExtractDependencyId` (type) - `/api-ox/core.md#extractdependencyid` from `packages/gunshi/src/plugin/core.ts`
- `IsOptionalDependency` (type) - `/api-ox/core.md#isoptionaldependency` from `packages/gunshi/src/plugin/core.ts`
- `InferDependencyExtensions` (type) - `/api-ox/core.md#inferdependencyextensions` from `packages/gunshi/src/plugin/core.ts`
- `DependencyExtensions` (type) - `/api-ox/core.md#dependencyextensions` from `packages/gunshi/src/plugin/core.ts`
- `DependencyParams` (type) - `/api-ox/core.md#dependencyparams` from `packages/gunshi/src/plugin/core.ts`
- `MergedPluginExtensions` (type) - `/api-ox/core.md#mergedpluginextensions` from `packages/gunshi/src/plugin/core.ts`
- `MergedPluginParams` (type) - `/api-ox/core.md#mergedpluginparams` from `packages/gunshi/src/plugin/core.ts`
- `resolveDependencies` (function) - `/api-ox/dependency.md#resolvedependencies` from `packages/gunshi/src/plugin/dependency.ts`
- `ExtractArgs` (type) - `/api-ox/types.md#extractargs` from `packages/gunshi/src/types.ts`
- `ExtractArgExplicitlyProvided` (type) - `/api-ox/types.md#extractargexplicitlyprovided` from `packages/gunshi/src/types.ts`
- `ExtractExtensions` (type) - `/api-ox/types.md#extractextensions` from `packages/gunshi/src/types.ts`
- `NormalizeToGunshiParams` (type) - `/api-ox/types.md#normalizetogunshiparams` from `packages/gunshi/src/types.ts`
- `MergeGunshiExtensions` (type) - `/api-ox/types.md#mergegunshiextensions` from `packages/gunshi/src/types.ts`
- `isLazyCommand` (function) - `/api-ox/utils.md#islazycommand` from `packages/gunshi/src/utils.ts`
- `resolveLazyCommand` (function) - `/api-ox/utils.md#resolvelazycommand` from `packages/gunshi/src/utils.ts`
- `create` (function) - `/api-ox/utils.md#create` from `packages/gunshi/src/utils.ts`
- `log` (function) - `/api-ox/utils.md#log` from `packages/gunshi/src/utils.ts`
- `getCommandSubCommands` (function) - `/api-ox/utils.md#getcommandsubcommands` from `packages/gunshi/src/utils.ts`
- `deepFreeze` (function) - `/api-ox/utils.md#deepfreeze` from `packages/gunshi/src/utils.ts`

## Duplicate ox-content Symbol Names

- `cli`
  - function `/api-ox/bone.md#cli` from `packages/gunshi/src/cli/bone.ts`
  - function `/api-ox/bone.md#cli` from `packages/gunshi/src/cli/bone.ts`
  - function `/api-ox/bone.md#cli` from `packages/gunshi/src/cli/bone.ts`
  - function `/api-ox/bone.md#cli` from `packages/gunshi/src/cli/bone.ts`
  - function `/api-ox/builtin.md#cli` from `packages/gunshi/src/cli/builtin.ts`
  - function `/api-ox/builtin.md#cli` from `packages/gunshi/src/cli/builtin.ts`
  - function `/api-ox/builtin.md#cli` from `packages/gunshi/src/cli/builtin.ts`
  - function `/api-ox/builtin.md#cli` from `packages/gunshi/src/cli/builtin.ts`
  - function `/api-ox/builtin.md#cli` from `packages/gunshi/src/cli/builtin.ts`
  - function `/api-ox/builtin.md#cli` from `packages/gunshi/src/cli/builtin.ts`
- `define`
  - function `/api-ox/definition.md#define` from `packages/gunshi/src/definition.ts`
  - function `/api-ox/definition.md#define` from `packages/gunshi/src/definition.ts`
- `lazy`
  - function `/api-ox/definition.md#lazy` from `packages/gunshi/src/definition.ts`
  - function `/api-ox/definition.md#lazy` from `packages/gunshi/src/definition.ts`
  - function `/api-ox/definition.md#lazy` from `packages/gunshi/src/definition.ts`
- `plugin`
  - function `/api-ox/core.md#plugin` from `packages/gunshi/src/plugin/core.ts`
  - function `/api-ox/core.md#plugin` from `packages/gunshi/src/plugin/core.ts`
  - function `/api-ox/core.md#plugin` from `packages/gunshi/src/plugin/core.ts`

## ox-content Output File Collisions

ox-content direct output uses source file basenames, so same-basename files can overwrite each other.

- `core.md`
  - `packages/gunshi/src/cli/core.ts`
  - `packages/gunshi/src/plugin/core.ts`
- `context.md`
  - `packages/gunshi/src/context.ts`
  - `packages/gunshi/src/plugin/context.ts`

## Generated Files

- `agent.md`
- `bone.md`
- `builtin.md`
- `constants.md`
- `context.md`
- `core.md`
- `decorators.md`
- `definition.md`
- `dependency.md`
- `docs.json`
- `generator.md`
- `index.md`
- `nav.ts`
- `types.md`
- `utils.md`

## Migration Notes

- Direct ox-content generation is source-file based. It does not reproduce current TypeDoc entrypoint modules such as `default`, `plugin`, and `combinators`.
- Barrel re-exports are not expanded. That is why `DefaultTranslation`, `string`, and other re-exported APIs are missing.
- Interface/class members are not rendered in the normalized Markdown output, so pages such as `Command` lose property tables.
- `@internal` is retained as a tag in direct output. Current TypeDoc uses `--excludeInternal`.
- Raw ox-content Markdown uses HTML `<details>` and `<pre><code>` blocks. In this comparison output they are minimally postprocessed with `v-pre` and code-block brace/newline escaping; without that, VitePress/Vue can fail while compiling examples that contain TypeScript syntax.
- To keep current docs quality, gunshi needs either ox-content upstream support for entrypoint/re-export/member-aware generation or a custom gunshi adapter/renderer on top of ox-content extraction.
