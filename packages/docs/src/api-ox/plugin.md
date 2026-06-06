# plugin

**[Source](https://github.com/kazupon/gunshi/blob/main/plugin)**

> 36 documented symbols. Read the signatures first, then expand each item for parameters, return types, and examples.

## Reference

### ANONYMOUS_COMMAND_NAME

#### Signature

```ts
export const ANONYMOUS_COMMAND_NAME = '(anonymous)'
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/constants.ts#L8)

### Args

An object that contains [argument schema](#argschema).

This type is used to define the structure and validation rules for command line arguments.

#### Signature

```ts
interface Args
```

#### Indexable

```ts
[option: string]: ArgSchema
```

### ArgSchema

An argument schema definition for command-line argument parsing.

This schema is similar to the schema of Node.js `util.parseArgs` but with extended features:

- Additional `required` and `description` properties
- Extended `type` support: 'string', 'boolean', 'number', 'enum', 'positional', 'custom'
- Simplified `default` property (single type, not union types)

#### Signature

```ts
interface ArgSchema
```

#### Properties

| Name                       | Type                                                                      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `choices` _(optional)_     | `string[] \| readonly string[]`                                           | Array of allowed string values for enum-type arguments. Required when `type: 'enum'`. The argument value must be one of these choices, otherwise an `ArgResolveError` with type 'type' will be thrown. Supports both mutable arrays and readonly arrays for type safety.                                                                                                                                                                                                                                                                                                                               |
| `conflicts` _(optional)_   | `string \| string[]`                                                      | Names of other options that conflict with this option. When this option is used together with any of the conflicting options, an `ArgResolveError` with type 'conflict' will be thrown. Conflicts only need to be defined on one side - if option A defines a conflict with option B, the conflict is automatically detected when both are used, regardless of whether B also defines a conflict with A. Supports both single option name or array of option names. Option names must match the property keys in the schema object exactly (no automatic conversion between camelCase and kebab-case). |
| `default` _(optional)_     | `string \| boolean \| number`                                             | Default value used when the argument is not provided. The type must match the argument's `type` property: - `string` type: string default - `boolean` type: boolean default - `number` type: number default - `enum` type: must be one of the `choices` values - `positional`/`custom` type: any appropriate default                                                                                                                                                                                                                                                                                   |
| `description` _(optional)_ | `string`                                                                  | Human-readable description of the argument's purpose. Used for help text generation and documentation. Should be concise but descriptive enough to understand the argument's role.                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `metavar` _(optional)_     | `string`                                                                  | Display name hint for help text generation. Provides a meaningful type hint for the argument value in help output. Particularly useful for `type: 'custom'` arguments where the type name would otherwise be unhelpful.                                                                                                                                                                                                                                                                                                                                                                                |
| `multiple` _(optional)_    | `true`                                                                    | Allows the argument to accept multiple values. When `true`, the resolved value becomes an array. For options: can be specified multiple times (--tag foo --tag bar) For positional: collects remaining positional arguments Note: Only `true` is allowed (not `false`) to make intent explicit.                                                                                                                                                                                                                                                                                                        |
| `negatable` _(optional)_   | `boolean`                                                                 | Enables negation for boolean arguments using `--no-` prefix. When `true`, allows users to explicitly set the boolean to `false` using `--no-option-name`. When `false` or omitted, only positive form is available. Only applicable to `type: 'boolean'` arguments.                                                                                                                                                                                                                                                                                                                                    |
| `parse` _(optional)_       | `(value: string) => any`                                                  | Custom parsing function for `type: 'custom'` arguments. Required when `type: 'custom'`. Receives the raw string value and must return the parsed result. Should throw an Error (or subclass) if parsing fails. The function's return type becomes the resolved argument type.                                                                                                                                                                                                                                                                                                                          |
| `required` _(optional)_    | `boolean`                                                                 | Marks the argument as required. When `true`, the argument must be provided by the user. If missing, an `ArgResolveError` with type 'required' will be thrown. Note: Only `true` is allowed (not `false`) to make intent explicit.                                                                                                                                                                                                                                                                                                                                                                      |
| `short` _(optional)_       | `string`                                                                  | Single character alias for the long option name. As example, allows users to use `-x` instead of `--extended-option`. Only valid for non-positional argument types.                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `toKebab` _(optional)_     | `true`                                                                    | Converts the argument name from camelCase to kebab-case for CLI usage. When `true`, a property like `maxCount` becomes available as `--max-count`. This allows [CAC](https://github.com/cacjs/cac) user-friendly property names while maintaining CLI conventions. Can be overridden globally with `resolveArgs({ toKebab: true })`. Note: Only `true` is allowed (not `false`) to make intent explicit.                                                                                                                                                                                               |
| `type`                     | `"string" \| "boolean" \| "number" \| "enum" \| "positional" \| "custom"` | Type of the argument value. - `'string'`: Text value (default if not specified) - `'boolean'`: `true`/`false` flag (can be negatable with `--no-` prefix) - `'number'`: Numeric value (parsed as integer or float) - `'enum'`: One of predefined string values (requires `choices` property) - `'positional'`: Non-option argument by position - `'custom'`: Custom parsing with user-defined `parse` function                                                                                                                                                                                         |

##### parse Parameters

| Name    | Type     | Description                        |
| ------- | -------- | ---------------------------------- |
| `value` | `string` | Raw string value from command line |

##### parse Returns

`any` — Parsed value of any type

#### Examples

Basic string argument:

```ts
const schema: ArgSchema = {
  type: 'string',
  description: 'Server hostname',
  default: 'localhost'
}
```

Required number argument with alias:

```ts
const schema: ArgSchema = {
  type: 'number',
  short: 'p',
  description: 'Port number to listen on',
  required: true
}
```

Enum argument with choices:

```ts
const schema: ArgSchema = {
  type: 'enum',
  choices: ['info', 'warn', 'error'],
  description: 'Logging level',
  default: 'info'
}
```

### ArgToken

Argument token.

#### Signature

```ts
interface ArgToken
```

#### Properties

| Name                       | Type           | Description                                                                                                                                                             |
| -------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index`                    | `number`       | Argument token index, e.g `--foo bar` => `--foo` index is 0, `bar` index is 1.                                                                                          |
| `inlineValue` _(optional)_ | `boolean`      | Inline value, e.g. `--foo=bar` => `true`, `-x=bar` => `true`.                                                                                                           |
| `kind`                     | `ArgTokenKind` | Argument token kind.                                                                                                                                                    |
| `name` _(optional)_        | `string`       | Option name, e.g. `--foo` => `foo`, `-x` => `x`.                                                                                                                        |
| `rawName` _(optional)_     | `string`       | Raw option name, e.g. `--foo` => `--foo`, `-x` => `-x`.                                                                                                                 |
| `value` _(optional)_       | `string`       | Option value, e.g. `--foo=bar` => `bar`, `-x=bar` => `bar`. If the `allowCompatible` option is `true`, short option value will be same as Node.js `parseArgs` behavior. |

### ArgValues

An object that contains the values of the arguments.

#### Signature

```ts
type ArgValues<T> = T extends Args
  ? ResolveArgValues<T, { [Arg in keyof T]: ExtractOptionValue<T[Arg]> }>
  : { [option: string]: string | boolean | number | (string | boolean | number)[] | undefined }
```

#### Type Parameters

| Name | Description                                                                    |
| ---- | ------------------------------------------------------------------------------ |
| `T`  | [Arguments](#args) which is an object that defines the command line arguments. |

### Awaitable

Awaitable type.

#### Signature

```ts
export type Awaitable<T> = T | Promise<T>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L16)

#### Type Parameters

| Name | Description                                |
| ---- | ------------------------------------------ |
| `T`  | The type of the value that can be awaited. |

### CLI_OPTIONS_DEFAULT

#### Signature

```ts
export const CLI_OPTIONS_DEFAULT: CliOptions<DefaultGunshiParams>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/constants.ts#L15-L31)

### Command

Command interface.

#### Signature

```ts
export interface Command<G extends GunshiParamsConstraint = DefaultGunshiParams>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L553-L613)

#### Type Parameters

| Name                                                                                                              | Description                      |
| ----------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `G` _extends_ [`GunshiParamsConstraint`](#gunshiparamsconstraint) = [`DefaultGunshiParams`](#defaultgunshiparams) | The Gunshi parameters constraint |

#### Properties

| Name                       | Type                                                                                                                                                    | Description                                                                                                                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `args` _(optional)_        | `ExtractArgs<G>`                                                                                                                                        | Command arguments. Each argument can include a description property to describe the argument in usage.                                                                                     |
| `description` _(optional)_ | `string`                                                                                                                                                | Command description. It's used to describe the command in usage and it's recommended to specify.                                                                                           |
| `entry` _(optional)_       | `boolean`                                                                                                                                               | Whether this command is an entry command. **Since** v0.27.0                                                                                                                                |
| `examples` _(optional)_    | `string` \| [`CommandExamplesFetcher`](#commandexamplesfetcher)\<`G`\>                                                                                  | Command examples. examples of how to use the command.                                                                                                                                      |
| `internal` _(optional)_    | `boolean`                                                                                                                                               | Whether this is an internal command. Internal commands are not shown in help usage. **Since** v0.27.0                                                                                      |
| `name` _(optional)_        | `string`                                                                                                                                                | Command name. It's used to find command line arguments to execute from sub commands, and it's recommended to specify.                                                                      |
| `rendering` _(optional)_   | [`RenderingOptions`](/api-ox/default.md#renderingoptions)\<`G`\>                                                                                        | Rendering control options **Since** v0.27.0                                                                                                                                                |
| `run` _(optional)_         | [`CommandRunner`](#commandrunner)\<`G`\>                                                                                                                | Command runner. it's the command to be executed                                                                                                                                            |
| `subCommands` _(optional)_ | `Record`\<`string`, [`SubCommandable`](/api-ox/default.md#subcommandable)\> \| `Map`\<`string`, [`SubCommandable`](/api-ox/default.md#subcommandable)\> | Nested sub-commands for this command. Allows building command trees like `git remote add`. Each key is the sub-command name, and the value is a command or lazy command. **Since** v0.28.0 |
| `toKebab` _(optional)_     | `boolean`                                                                                                                                               | Whether to convert the camel-case style argument name to kebab-case. If you will set to `true`, All [`Command.args`](#command-args) names will be converted to kebab-case.                 |

### CommandContext

Command context.

Command context is the context of the command execution.

#### Signature

```ts
export interface CommandContext<G extends GunshiParamsConstraint = DefaultGunshiParams>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L378-L476)

#### Type Parameters

| Name                                                                                                              | Description                                                                               |
| ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `G` _extends_ [`GunshiParamsConstraint`](#gunshiparamsconstraint) = [`DefaultGunshiParams`](#defaultgunshiparams) | A type extending [`GunshiParams`](#gunshiparams) to specify the shape of command context. |

#### Properties

| Name                           | Type                                                                               | Description                                                                                                                                                                                                                                                                                                                               |
| ------------------------------ | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_`                            | `string[]`                                                                         | Original command line arguments. This argument is passed from `cli` function.                                                                                                                                                                                                                                                             |
| `args`                         | `ExtractArgs<G>`                                                                   | Command arguments, that is the arguments of the command that is executed. The command arguments is same [`Command.args`](#command-args).                                                                                                                                                                                                  |
| `callMode`                     | [`CommandCallMode`](/api-ox/default.md#commandcallmode)                            | Command call mode. The command call mode is `entry` when the command is executed as an entry command, and `subCommand` when the command is executed as a sub-command.                                                                                                                                                                     |
| `commandPath`                  | `string[]`                                                                         | The path of nested sub-commands that were resolved to reach the current command. For example, if the user runs `git remote add`, `commandPath` would be `['remote', 'add']`. For the entry command, this is an empty array. **Since** v0.28.0                                                                                             |
| `description`                  | `string \| undefined`                                                              | Command description, that is the description of the command that is executed. The command description is same [`CommandEnvironment.description`](/api-ox/default.md#commandenvironment-description).                                                                                                                                      |
| `env`                          | `Readonly`\<[`CommandEnvironment`](/api-ox/default.md#commandenvironment)\<`G`\>\> | Command environment, that is the environment of the command that is executed. The command environment is same [`CommandEnvironment`](/api-ox/default.md#commandenvironment).                                                                                                                                                              |
| `explicit`                     | `ExtractArgExplicitlyProvided<G>`                                                  | Whether arguments were explicitly provided by the user. - `true`: The argument was explicitly provided via command line - `false`: The argument was not explicitly provided. This means either: - The value comes from a default value defined in the argument schema - The value is `undefined` (no explicit input and no default value) |
| `extensions`                   | `keyof ExtractExtensions<G> extends never ? any : ExtractExtensions<G>`            | Command context extensions. **Since** v0.27.0                                                                                                                                                                                                                                                                                             |
| `log`                          | `(message?: any, ...optionalParams: any[]) => void`                                | Output a message. If [`CommandEnvironment.usageSilent`](/api-ox/default.md#commandenvironment-usagesilent) is true, the message is not output.                                                                                                                                                                                            |
| `name`                         | `string \| undefined`                                                              | Command name, that is the command that is executed. The command name is same [`CommandEnvironment.name`](/api-ox/default.md#commandenvironment-name).                                                                                                                                                                                     |
| `omitted`                      | `boolean`                                                                          | Whether the currently executing command has been executed with the sub-command name omitted.                                                                                                                                                                                                                                              |
| `positionals`                  | `string[]`                                                                         | Command positionals arguments, that is the positionals of the command that is executed. Resolve positionals with `resolveArgs` from command arguments.                                                                                                                                                                                    |
| `rest`                         | `string[]`                                                                         | Command rest arguments, that is the remaining argument not resolved by the optional command option delimiter `--`.                                                                                                                                                                                                                        |
| `toKebab` _(optional)_         | `boolean`                                                                          | Whether to convert the camel-case style argument name to kebab-case. This context value is set from [`Command.toKebab`](#command-tokebab) option.                                                                                                                                                                                         |
| `tokens`                       | [`ArgToken`](#argtoken)\[\]                                                        | Argument tokens, that is parsed by `parseArgs` function.                                                                                                                                                                                                                                                                                  |
| `validationError` _(optional)_ | `AggregateError`                                                                   | Validation error from argument parsing. This will be set if argument validation fails during CLI execution.                                                                                                                                                                                                                               |
| `values`                       | [`ArgValues`](#argvalues)\<`ExtractArgs`\<`G`\>\>                                  | Command values, that is the values of the command that is executed. Resolve values with `resolveArgs` from command arguments and [`Command.args`](#command-args).                                                                                                                                                                         |

##### log Parameters

| Name             | Type    | Description                                       |
| ---------------- | ------- | ------------------------------------------------- |
| `message`        | `any`   | an output message, see `console.log` _(optional)_ |
| `optionalParams` | `any[]` | an optional parameters, see `console.log`         |

##### log Returns

`void`

### CommandContextCore

Readonly command context available to a command context extension factory.

#### Since

v0.27.0

#### Signature

```ts
export type CommandContextCore<G extends GunshiParamsConstraint = DefaultGunshiParams> = Readonly<
  CommandContext<G>
>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L485-L487)

#### Type Parameters

| Name                                                                                                              | Description                                                                               |
| ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `G` _extends_ [`GunshiParamsConstraint`](#gunshiparamsconstraint) = [`DefaultGunshiParams`](#defaultgunshiparams) | A type extending [`GunshiParams`](#gunshiparams) to specify the shape of command context. |

### CommandContextExtension

Command context extension

#### Since

v0.27.0

#### Signature

```ts
export interface CommandContextExtension<
  E extends GunshiParams['extensions'] = DefaultGunshiParams['extensions']
>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L496-L511)

#### Type Parameters

| Name                                                                                                                          | Description                                                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `E` _extends_ [`GunshiParams`](#gunshiparams)\['extensions'\] = [`DefaultGunshiParams`](#defaultgunshiparams)\['extensions'\] | A type extending [`GunshiParams.extensions`](#gunshiparams-extensions) to specify the shape of the extension. |

#### Properties

| Name                               | Type                                                                                                                                           | Description                         |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `factory` _(readonly)_             | (`ctx`: [`CommandContextCore`](#commandcontextcore), `cmd`: [`Command`](#command)) =\> [`Awaitable`](#awaitable)\<`E`\>                        | Plugin extension factory            |
| `key` _(readonly)_                 | `symbol`                                                                                                                                       | Plugin identifier                   |
| `onFactory` _(optional, readonly)_ | (`ctx`: `Readonly`\<[`CommandContext`](#commandcontext)\>, `cmd`: `Readonly`\<[`Command`](#command)\>) =\> [`Awaitable`](#awaitable)\<`void`\> | Plugin extension factory after hook |

##### factory Parameters

| Name  | Type                                        | Description |
| ----- | ------------------------------------------- | ----------- |
| `ctx` | [`CommandContextCore`](#commandcontextcore) |             |
| `cmd` | [`Command`](#command)                       |             |

##### factory Returns

[`Awaitable`](#awaitable)\<`E`\>

##### onFactory Parameters

| Name  | Type                                              | Description |
| ----- | ------------------------------------------------- | ----------- |
| `ctx` | `Readonly`\<[`CommandContext`](#commandcontext)\> |             |
| `cmd` | `Readonly`\<[`Command`](#command)\>               |             |

##### onFactory Returns

[`Awaitable`](#awaitable)\<`void`\>

### CommandContextParams

Parameters of [createCommandContext](#createcommandcontext)

#### Signature

```ts
export interface CommandContextParams<
  G extends GunshiParams | { args: Args } | { extensions: ExtendContext },
  V extends ArgValues<ExtractArgs<G>>,
  C extends Command<G> | LazyCommand<G> = Command<G>,
  E extends Record<string, CommandContextExtension> = Record<string, CommandContextExtension>
>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/context.ts#L71-L135)

#### Type Parameters

| Name                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `G` _extends_ [`GunshiParams`](#gunshiparams) \| { [`args`](/api-ox/combinators.md#args): [`Args`](#args) } \| { `extensions`: [`ExtendContext`](#extendcontext) }      |
| `V` _extends_ [`ArgValues`](#argvalues)\<`ExtractArgs`\<`G`\>\>                                                                                                         |
| `C` _extends_ [`Command`](#command)\<`G`\> \| [`LazyCommand`](#lazycommand)\<`G`\> = [`Command`](#command)\<`G`\>                                                       |
| `E` _extends_ `Record`\<`string`, [`CommandContextExtension`](#commandcontextextension)\> = `Record`\<`string`, [`CommandContextExtension`](#commandcontextextension)\> |

#### Properties

| Name                           | Type                                                    | Description                                                            |
| ------------------------------ | ------------------------------------------------------- | ---------------------------------------------------------------------- |
| `args` _(optional)_            | `ExtractArgs<G>`                                        | An arguments of target command                                         |
| `argv` _(optional)_            | `string[]`                                              | Original command line arguments                                        |
| `callMode` _(optional)_        | [`CommandCallMode`](/api-ox/default.md#commandcallmode) | Command call mode.                                                     |
| `cliOptions` _(optional)_      | [`CliOptions`](/api-ox/default.md#clioptions)\<`G`\>    | A command options, which is spicialized from `cli` function            |
| `command` _(optional)_         | `C`                                                     | A target command                                                       |
| `commandPath` _(optional)_     | `string[]`                                              | The path of nested sub-commands resolved to reach the current command. |
| `explicit` _(optional)_        | `ExtractArgExplicitlyProvided<G>`                       | Explicitly provided arguments                                          |
| `extensions` _(optional)_      | `E`                                                     | Plugin extensions to apply as the command context extension.           |
| `omitted` _(optional)_         | `boolean`                                               | Whether the command is omitted                                         |
| `positionals` _(optional)_     | `string[]`                                              | A positionals arguments, which passed to the target command            |
| `rest` _(optional)_            | `string[]`                                              | A rest arguments, which passed to the target command                   |
| `tokens` _(optional)_          | [`ArgToken`](#argtoken)\[\]                             | Argument tokens that are parsed by the `parseArgs` function            |
| `validationError` _(optional)_ | `AggregateError`                                        | Validation error from argument parsing.                                |
| `values` _(optional)_          | `V`                                                     | A values of target command                                             |

### CommandDecorator

Command decorator.

A function that wraps a command runner to add or modify its behavior.

#### Since

v0.27.0

#### Signature

```ts
export type CommandDecorator<G extends GunshiParamsConstraint = DefaultGunshiParams> = (
  baseRunner: (ctx: Readonly<CommandContext<G>>) => Awaitable<string | void>
) => (ctx: Readonly<CommandContext<G>>) => Awaitable<string | void>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L760-L762)

#### Type Parameters

| Name                                                                                                              | Description                                                                               |
| ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `G` _extends_ [`GunshiParamsConstraint`](#gunshiparamsconstraint) = [`DefaultGunshiParams`](#defaultgunshiparams) | A type extending [`GunshiParams`](#gunshiparams) to specify the shape of command context. |

#### Parameters

| Name         | Type                                                                                                                  | Description                         |
| ------------ | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `baseRunner` | (`ctx`: `Readonly`\<[`CommandContext`](#commandcontext)\<`G`\>\>) =\> [`Awaitable`](#awaitable)\<`string` \| `void`\> | The base command runner to decorate |

#### Returns

(`ctx`: `Readonly`\<[`CommandContext`](#commandcontext)\<`G`\>\>) =\> [`Awaitable`](#awaitable)\<`string` | `void`\> — The decorated command runner

### CommandExamplesFetcher

Command examples fetcher.

#### Signature

```ts
export type CommandExamplesFetcher<G extends GunshiParamsConstraint = DefaultGunshiParams> = (
  ctx: Readonly<CommandContext<G>>
) => Awaitable<string>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L718-L720)

#### Type Parameters

| Name                                                                                                              | Description                                                                               |
| ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `G` _extends_ [`GunshiParamsConstraint`](#gunshiparamsconstraint) = [`DefaultGunshiParams`](#defaultgunshiparams) | A type extending [`GunshiParams`](#gunshiparams) to specify the shape of command context. |

#### Parameters

| Name  | Type                                                     | Description                          |
| ----- | -------------------------------------------------------- | ------------------------------------ |
| `ctx` | `Readonly`\<[`CommandContext`](#commandcontext)\<`G`\>\> | A [command context](#commandcontext) |

#### Returns

[`Awaitable`](#awaitable)\<`string`\> — A fetched command examples.

### CommandRunner

Command runner.

#### Signature

```ts
export type CommandRunner<G extends GunshiParamsConstraint = DefaultGunshiParams> = (
  ctx: Readonly<CommandContext<G>>
) => Awaitable<string | void>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L730-L732)

#### Type Parameters

| Name                                                                                                              | Description                                                                               |
| ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `G` _extends_ [`GunshiParamsConstraint`](#gunshiparamsconstraint) = [`DefaultGunshiParams`](#defaultgunshiparams) | A type extending [`GunshiParams`](#gunshiparams) to specify the shape of command context. |

#### Parameters

| Name  | Type                                                     | Description                          |
| ----- | -------------------------------------------------------- | ------------------------------------ |
| `ctx` | `Readonly`\<[`CommandContext`](#commandcontext)\<`G`\>\> | A [command context](#commandcontext) |

#### Returns

[`Awaitable`](#awaitable)\<`string` | `void`\> — void or string (for CLI output)

### createCommandContext

Create a command context.

#### Signature

```ts
export async function createCommandContext<
  G extends GunshiParamsConstraint = DefaultGunshiParams,
  V extends ArgValues<ExtractArgs<G>> = ArgValues<ExtractArgs<G>>,
  C extends Command<G> | LazyCommand<G> = Command<G>,
  E extends Record<string, CommandContextExtension> = {}
>({
  args = {} as ExtractArgs<G>,
  explicit = {} as ExtractArgExplicitlyProvided<G>,
  values = {} as V,
  positionals = [],
  rest = [],
  argv = [],
  tokens = [],
  command = {} as C,
  extensions = {} as E,
  cliOptions = {} as CliOptions<G>,
  callMode = 'entry',
  commandPath = [],
  omitted = false,
  validationError
}: CommandContextParams<G, V, C, E>): Promise<CommandContextResult<G, E>>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/context.ts#L143-L243)

#### Type Parameters

| Name                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------- |
| `G` _extends_ [`GunshiParamsConstraint`](#gunshiparamsconstraint) = [`DefaultGunshiParams`](#defaultgunshiparams)   |
| `V` _extends_ [`ArgValues`](#argvalues)\<`ExtractArgs`\<`G`\>\> = [`ArgValues`](#argvalues)\<`ExtractArgs`\<`G`\>\> |
| `C` _extends_ [`Command`](#command)\<`G`\> \| [`LazyCommand`](#lazycommand)\<`G`\> = [`Command`](#command)\<`G`\>   |
| `E` _extends_ `Record`\<`string`, [`CommandContextExtension`](#commandcontextextension)\> = `{}`                    |

#### Parameters

| Name    | Type                                                                  | Description                                                        |
| ------- | --------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `param` | [`CommandContextParams`](#commandcontextparams)\<`G`, `V`, `C`, `E`\> | A [parameters](#commandcontextparams) to create a command context. |

#### Returns

`Promise<CommandContextResult<G, E>>` — A [command context](#commandcontext), which is readonly.

### DefaultGunshiParams

Default Gunshi parameters.

#### Since

v0.27.0

#### Signature

```ts
export type DefaultGunshiParams = GunshiParams
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L67)

### ExtendContext

Extend command context type. This type is used to extend the command context with additional properties at [`CommandContext.extensions`](#commandcontext-extensions).

#### Since

v0.27.0

#### Signature

```ts
export type ExtendContext = Record<string, unknown>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L30)

### GunshiParams

Gunshi unified parameter type.

This type combines both argument definitions and command context extensions.

#### Since

v0.27.0

#### Signature

```ts
export interface GunshiParams<
  P extends {
    args?: Args
    extensions?: ExtendContext
  } = {
    args: Args
    extensions: {}
  }
>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L42-L59)

#### Type Parameters

| Name                                                                                                                                                                                                     | Description                                                        |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `P` _extends_ { [`args`](/api-ox/combinators.md#args)?: [`Args`](#args) `extensions`?: [`ExtendContext`](#extendcontext) } = { [`args`](/api-ox/combinators.md#args): [`Args`](#args) `extensions`: {} } | The type of parameters, which can include `args` and `extensions`. |

#### Properties

| Name         | Type                                                                                                                   | Description                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| `args`       | `P` `extends` { [`args`](/api-ox/combinators.md#args): `infer` `A` `extends` [`Args`](#args) } ? `A` : [`Args`](#args) | Command argument definitions. |
| `extensions` | `P` `extends` { `extensions`: `infer` `E` `extends` [`ExtendContext`](#extendcontext) } ? `E` : {}                     | Command context extensions.   |

### GunshiParamsConstraint

Generic constraint for command-related types.

This type constraint allows both [`GunshiParams`](#gunshiparams) and objects with extensions.

#### Since

v0.27.0

#### Signature

```ts
export type GunshiParamsConstraint =
  | GunshiParams<any>
  | { args: Args }
  | { extensions: ExtendContext }
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L76-L83)

### LazyCommand

Lazy command interface.

Lazy command that's not loaded until it is executed.

#### Signature

```ts
export type LazyCommand<
  G extends GunshiParamsConstraint = DefaultGunshiParams,
  D extends Partial<Command<G>> = {}
> = { (): Awaitable<Command<G> | CommandRunner<G>> } & (D extends { name: infer N }
  ? { commandName: N }
  : { commandName?: string }) &
  Omit<D, 'name' | 'run'> &
  Partial<Omit<Command<G>, keyof D | 'run' | 'name'>>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L623-L637)

#### Type Parameters

| Name                                                                                                              | Description                                              |
| ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `G` _extends_ [`GunshiParamsConstraint`](#gunshiparamsconstraint) = [`DefaultGunshiParams`](#defaultgunshiparams) | The Gunshi parameters constraint                         |
| `D` _extends_ `Partial`\<[`Command`](#command)\<`G`\>\> = `{}`                                                    | The partial command definition provided to lazy function |

### OnPluginExtension

Plugin extension callback, which is called when the plugin is extended with `extension` option.

#### Since

v0.27.0

#### Signature

```ts
export type OnPluginExtension<G extends GunshiParams = DefaultGunshiParams> = (
  ctx: Readonly<CommandContext<G>>,
  cmd: Readonly<Command<G>>
) => Awaitable<void>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L131-L134)

#### Type Parameters

| Name                                                                                          | Description                                                                                                                             |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `G` _extends_ [`GunshiParams`](#gunshiparams) = [`DefaultGunshiParams`](#defaultgunshiparams) | A type extending [`GunshiParams`](#gunshiparams) to specify the shape of [`CommandContext`](#commandcontext) and [`Command`](#command). |

#### Parameters

| Name  | Type                                                     | Description                              |
| ----- | -------------------------------------------------------- | ---------------------------------------- |
| `ctx` | `Readonly`\<[`CommandContext`](#commandcontext)\<`G`\>\> | The [`command context`](#commandcontext) |
| `cmd` | `Readonly`\<[`Command`](#command)\<`G`\>\>               | The [`command`](#command)                |

#### Returns

[`Awaitable`](#awaitable)\<`void`\>

### Plugin

Gunshi plugin, which is a function that receives a PluginContext.

#### Since

v0.27.0

#### Signature

```ts
export type Plugin<E extends GunshiParams['extensions'] = DefaultGunshiParams['extensions']> =
  PluginFunction & {
    id: string
    name?: string
    dependencies?: (PluginDependency | string)[]
    extension?: CommandContextExtension<E>
  }
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L255-L261)

#### Type Parameters

| Name                                                                                                                          | Description                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `E` _extends_ [`GunshiParams`](#gunshiparams)\['extensions'\] = [`DefaultGunshiParams`](#defaultgunshiparams)\['extensions'\] | A type extending [GunshiParams](#gunshiparams) to specify the shape of [`CommandContext`](#commandcontext)'s extensions. |

#### Properties

| Name                        | Type                                                         | Description |
| --------------------------- | ------------------------------------------------------------ | ----------- |
| `dependencies` _(optional)_ | ([`PluginDependency`](#plugindependency) \| `string`)\[\]    |             |
| `extension` _(optional)_    | [`CommandContextExtension`](#commandcontextextension)\<`E`\> |             |
| `id`                        | `string`                                                     |             |
| `name` _(optional)_         | `string`                                                     |             |

#### Parameters

| Name  | Type                                                   | Description                          |
| ----- | ------------------------------------------------------ | ------------------------------------ |
| `ctx` | `Readonly`\<[`PluginContext`](#plugincontext)\<`G`\>\> | A [`PluginContext`](#plugincontext). |

#### Returns

[`Awaitable`](#awaitable)\<`void`\> — An [`Awaitable`](#awaitable) that resolves when the plugin is loaded.

### plugin

Define a plugin with extension compatibility and typed dependency extensions

#### Since

v0.27.0

#### Signature

```ts
export function plugin<
  Context extends ExtendContext = DefaultGunshiParams['extensions'], // for plugin dependency extensions
  Id extends string = string, // for plugin id
  Deps extends ReadonlyArray<PluginDependency | string> = [], // for plugin dependencies
  Extension extends {} = {}, // for plugin extension type
  ResolvedDepExtensions extends GunshiParams = DependencyParams<Deps, Context>,
  PluginExt extends PluginExtension<Extension, DefaultGunshiParams> = PluginExtension<
    Extension,
    ResolvedDepExtensions
  >,
  MergedExtensions extends GunshiParams = MergedPluginParams<
    Id,
    Deps,
    Context,
    Awaited<ReturnType<PluginExt>>
  >
>(options: {
  id: Id
  name?: string
  dependencies?: Deps
  setup?: (
    ctx: Readonly<
      PluginContext<MergedPluginParams<Id, Deps, Context, Awaited<ReturnType<PluginExt>>>>
    >
  ) => Awaitable<void>
  extension: PluginExt
  onExtension?: OnPluginExtension<MergedExtensions>
}): PluginWithExtension<Awaited<ReturnType<PluginExt>>>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L328-L355)

#### Type Parameters

| Name                                                                                                                                                                                                      | Description                                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `Context` _extends_ [`ExtendContext`](#extendcontext) = [`DefaultGunshiParams`](#defaultgunshiparams)\['extensions'\]                                                                                     | A type extending [`ExtendContext`](#extendcontext) to specify the shape of plugin dependency extensions.  |
| `Id` _extends_ `string` = `string`                                                                                                                                                                        | A string type to specify the plugin ID.                                                                   |
| `Deps` _extends_ `ReadonlyArray`\<[`PluginDependency`](#plugindependency) \| `string`\> = `[]`                                                                                                            | A readonly array of [`PluginDependency`](#plugindependency) or string to specify the plugin dependencies. |
| `Extension` _extends_ `{}` = `{}`                                                                                                                                                                         | A type to specify the shape of the plugin extension object.                                               |
| `ResolvedDepExtensions` _extends_ [`GunshiParams`](#gunshiparams) = `DependencyParams<Deps, Context>`                                                                                                     | -                                                                                                         |
| `PluginExt` _extends_ [`PluginExtension`](#pluginextension)\<`Extension`, [`DefaultGunshiParams`](#defaultgunshiparams)\> = [`PluginExtension`](#pluginextension)\<`Extension`, `ResolvedDepExtensions`\> | -                                                                                                         |
| `MergedExtensions` _extends_ [`GunshiParams`](#gunshiparams) = `MergedPluginParams<Id, Deps, Context, Awaited<ReturnType<PluginExt>>>`                                                                    | -                                                                                                         |

#### Parameters

| Name                    | Type                                                                                                                                                                                                                                                                                                                                                                           | Description                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| `options`               | { `id`: `Id`; `name`?: `string`; `dependencies`?: `Deps`; `setup`?: (`ctx`: `Readonly`\<[`PluginContext`](#plugincontext)\<`MergedPluginParams`\<`Id`, `Deps`, `Context`, `Awaited`\<`ReturnType`\<`PluginExt`\>\>\>\>\>) =\> [`Awaitable`](#awaitable)\<`void`\>; `extension`: `PluginExt`; `onExtension`?: [`OnPluginExtension`](#onpluginextension)\<`MergedExtensions`\> } | [`plugin options`](#pluginoptions) |
| `options.id`            | `Id`                                                                                                                                                                                                                                                                                                                                                                           |                                    |
| `options.name?`         | `string`                                                                                                                                                                                                                                                                                                                                                                       | _optional_                         |
| `options.dependencies?` | `Deps`                                                                                                                                                                                                                                                                                                                                                                         | _optional_                         |
| `options.setup?`        | (`ctx`: `Readonly`\<[`PluginContext`](#plugincontext)\<`MergedPluginParams`\<`Id`, `Deps`, `Context`, `Awaited`\<`ReturnType`\<`PluginExt`\>\>\>\>\>) =\> [`Awaitable`](#awaitable)\<`void`\>                                                                                                                                                                                  | _optional_                         |
| `options.extension`     | `PluginExt`                                                                                                                                                                                                                                                                                                                                                                    |                                    |
| `options.onExtension?`  | [`OnPluginExtension`](#onpluginextension)\<`MergedExtensions`\>                                                                                                                                                                                                                                                                                                                | _optional_                         |

#### Returns

[`PluginWithExtension`](#pluginwithextension)\<`Awaited`\<`ReturnType`\<`PluginExt`\>\>\> — A defined plugin with extension

### plugin

Define a plugin without extension and typed dependency extensions

#### Since

v0.27.0

#### Signature

```ts
export function plugin<
  Context extends ExtendContext = DefaultGunshiParams['extensions'], // for plugin dependency extensions
  Id extends string = string, // for plugin id
  Deps extends ReadonlyArray<PluginDependency | string> = [], // for plugin dependencies
  Extension extends Record<string, unknown> = {}, // for plugin extension type
  ResolvedDepExtensions extends GunshiParams = DependencyParams<Deps, Context>,
  PluginExt extends PluginExtension<Extension, DefaultGunshiParams> = PluginExtension<
    Extension,
    ResolvedDepExtensions
  >,
  MergedExtensions extends GunshiParams = MergedPluginParams<
    Id,
    Deps,
    Context,
    Awaited<ReturnType<PluginExt>>
  >
>(options: {
  id: Id
  name?: string
  dependencies?: Deps
  setup?: (
    ctx: Readonly<
      PluginContext<MergedPluginParams<Id, Deps, Context, Awaited<ReturnType<PluginExt>>>>
    >
  ) => Awaitable<void>
  onExtension?: OnPluginExtension<MergedExtensions>
}): PluginWithoutExtension<DefaultGunshiParams['extensions']>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L370-L396)

#### Type Parameters

| Name                                                                                                                                                                                                      | Description                                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `Context` _extends_ [`ExtendContext`](#extendcontext) = [`DefaultGunshiParams`](#defaultgunshiparams)\['extensions'\]                                                                                     | A type extending [`ExtendContext`](#extendcontext) to specify the shape of plugin dependency extensions.  |
| `Id` _extends_ `string` = `string`                                                                                                                                                                        | A string type to specify the plugin ID.                                                                   |
| `Deps` _extends_ `ReadonlyArray`\<[`PluginDependency`](#plugindependency) \| `string`\> = `[]`                                                                                                            | A readonly array of [`PluginDependency`](#plugindependency) or string to specify the plugin dependencies. |
| `Extension` _extends_ `Record<string, unknown>` = `{}`                                                                                                                                                    | A type to specify the shape of the plugin extension object.                                               |
| `ResolvedDepExtensions` _extends_ [`GunshiParams`](#gunshiparams) = `DependencyParams<Deps, Context>`                                                                                                     | -                                                                                                         |
| `PluginExt` _extends_ [`PluginExtension`](#pluginextension)\<`Extension`, [`DefaultGunshiParams`](#defaultgunshiparams)\> = [`PluginExtension`](#pluginextension)\<`Extension`, `ResolvedDepExtensions`\> | -                                                                                                         |
| `MergedExtensions` _extends_ [`GunshiParams`](#gunshiparams) = `MergedPluginParams<Id, Deps, Context, Awaited<ReturnType<PluginExt>>>`                                                                    | -                                                                                                         |

#### Parameters

| Name                    | Type                                                                                                                                                                                                                                                                                                                                                 | Description                                          |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `options`               | { `id`: `Id`; `name`?: `string`; `dependencies`?: `Deps`; `setup`?: (`ctx`: `Readonly`\<[`PluginContext`](#plugincontext)\<`MergedPluginParams`\<`Id`, `Deps`, `Context`, `Awaited`\<`ReturnType`\<`PluginExt`\>\>\>\>\>) =\> [`Awaitable`](#awaitable)\<`void`\>; `onExtension`?: [`OnPluginExtension`](#onpluginextension)\<`MergedExtensions`\> } | [`plugin options`](#pluginoptions) without extension |
| `options.id`            | `Id`                                                                                                                                                                                                                                                                                                                                                 |                                                      |
| `options.name?`         | `string`                                                                                                                                                                                                                                                                                                                                             | _optional_                                           |
| `options.dependencies?` | `Deps`                                                                                                                                                                                                                                                                                                                                               | _optional_                                           |
| `options.setup?`        | (`ctx`: `Readonly`\<[`PluginContext`](#plugincontext)\<`MergedPluginParams`\<`Id`, `Deps`, `Context`, `Awaited`\<`ReturnType`\<`PluginExt`\>\>\>\>\>) =\> [`Awaitable`](#awaitable)\<`void`\>                                                                                                                                                        | _optional_                                           |
| `options.onExtension?`  | [`OnPluginExtension`](#onpluginextension)\<`MergedExtensions`\>                                                                                                                                                                                                                                                                                      | _optional_                                           |

#### Returns

[`PluginWithoutExtension`](#pluginwithoutextension)\<[`DefaultGunshiParams`](#defaultgunshiparams)\['extensions'\]\> — A defined plugin without extension

### plugin

Define a plugin

#### Since

v0.27.0

#### Signature

```ts
export function plugin(options: any = {}): any
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L406-L465)

#### Parameters

| Name      | Type  | Description                                                  |
| --------- | ----- | ------------------------------------------------------------ |
| `options` | `any` | [`plugin options`](#pluginoptions) _(optional, default: {})_ |

#### Returns

`any` — A defined plugin

### PluginContext

Gunshi plugin context interface.

#### Since

v0.27.0

#### Signature

```ts
export interface PluginContext<G extends GunshiParamsConstraint = DefaultGunshiParams>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/context.ts#L28-L131)

#### Type Parameters

| Name                                                                                                              | Description                                                                                  |
| ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `G` _extends_ [`GunshiParamsConstraint`](#gunshiparamsconstraint) = [`DefaultGunshiParams`](#defaultgunshiparams) | A type extending [`GunshiParams`](#gunshiparams) to specify the shape of command parameters. |

#### Properties

| Name                         | Type                                                                                            | Description                     |
| ---------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------- |
| `globalOptions` _(readonly)_ | `Map`\<`string`, [`ArgSchema`](#argschema)\>                                                    | Get the global options          |
| `subCommands` _(readonly)_   | `ReadonlyMap`\<`string`, [`Command`](#command)\<`G`\> \| [`LazyCommand`](#lazycommand)\<`G`\>\> | Get the registered sub commands |

#### Methods

##### addCommand()

```ts
addCommand(name: string, command: Command<G> | LazyCommand<G>): void;
```

Add a sub command.

###### Parameters

| Name      | Type                                                                 | Description        |
| --------- | -------------------------------------------------------------------- | ------------------ |
| `name`    | `string`                                                             | Command name       |
| `command` | [`Command`](#command)\<`G`\> \| [`LazyCommand`](#lazycommand)\<`G`\> | Command definition |

###### Returns

`void`

---

##### addGlobalOption()

```ts
addGlobalOption(name: string, schema: ArgSchema): void;
```

Add a global option.

###### Parameters

| Name     | Type                      | Description                                 |
| -------- | ------------------------- | ------------------------------------------- |
| `name`   | `string`                  | An option name                              |
| `schema` | [`ArgSchema`](#argschema) | An [`ArgSchema`](#argschema) for the option |

###### Returns

`void`

---

##### decorateCommand()

```ts
decorateCommand<L extends Record<string, unknown> = DefaultGunshiParams['extensions']>(decorator: (
      baseRunner: (
        ctx: Readonly<CommandContext<MergeGunshiExtensions<G, L>>>
      ) => Awaitable<void | string>
    ) => (ctx: Readonly<CommandContext<MergeGunshiExtensions<G, L>>>) => Awaitable<void | string>): void;
```

Decorate the command execution.

Decorators are applied in reverse order (last registered is executed first).

###### Type Parameters

| Name                                                                                                    | Description                                                                                  |
| ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `L` _extends_ `Record<string, unknown>` = [`DefaultGunshiParams`](#defaultgunshiparams)\['extensions'\] | An extensions type to specify the shape of [`CommandContext`](#commandcontext)'s extensions. |

###### Parameters

| Name        | Type                                                                                                                                                                                                                                                                                                                            | Description                                        |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `decorator` | (`baseRunner`: (`ctx`: `Readonly`\<[`CommandContext`](#commandcontext)\<`MergeGunshiExtensions`\<`G`, `L`\>\>\>) =\> [`Awaitable`](#awaitable)\<`void` \| `string`\>) =\> (`ctx`: `Readonly`\<[`CommandContext`](#commandcontext)\<`MergeGunshiExtensions`\<`G`, `L`\>\>\>) =\> [`Awaitable`](#awaitable)\<`void` \| `string`\> | A decorator function that wraps the command runner |

###### Returns

`void`

---

##### decorateHeaderRenderer()

```ts
decorateHeaderRenderer<L extends Record<string, unknown> = DefaultGunshiParams['extensions']>(decorator: (
      baseRenderer: (ctx: Readonly<CommandContext<MergeGunshiExtensions<G, L>>>) => Promise<string>,
      ctx: Readonly<CommandContext<MergeGunshiExtensions<G, L>>>
    ) => Promise<string>): void;
```

Decorate the header renderer.

###### Type Parameters

| Name                                                                                                    | Description                                                                                  |
| ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `L` _extends_ `Record<string, unknown>` = [`DefaultGunshiParams`](#defaultgunshiparams)\['extensions'\] | An extensions type to specify the shape of [`CommandContext`](#commandcontext)'s extensions. |

###### Parameters

| Name        | Type                                                                                                                                                                                                                                                                     | Description                                               |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| `decorator` | (`baseRenderer`: (`ctx`: `Readonly`\<[`CommandContext`](#commandcontext)\<`MergeGunshiExtensions`\<`G`, `L`\>\>\>) =\> `Promise`\<`string`\>, `ctx`: `Readonly`\<[`CommandContext`](#commandcontext)\<`MergeGunshiExtensions`\<`G`, `L`\>\>\>) =\> `Promise`\<`string`\> | A decorator function that wraps the base header renderer. |

###### Returns

`void`

---

##### decorateUsageRenderer()

```ts
decorateUsageRenderer<L extends Record<string, unknown> = DefaultGunshiParams['extensions']>(decorator: (
      baseRenderer: (ctx: Readonly<CommandContext<MergeGunshiExtensions<G, L>>>) => Promise<string>,
      ctx: Readonly<CommandContext<MergeGunshiExtensions<G, L>>>
    ) => Promise<string>): void;
```

Decorate the usage renderer.

###### Type Parameters

| Name                                                                                                    | Description                                                                                  |
| ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `L` _extends_ `Record<string, unknown>` = [`DefaultGunshiParams`](#defaultgunshiparams)\['extensions'\] | An extensions type to specify the shape of [`CommandContext`](#commandcontext)'s extensions. |

###### Parameters

| Name        | Type                                                                                                                                                                                                                                                                     | Description                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| `decorator` | (`baseRenderer`: (`ctx`: `Readonly`\<[`CommandContext`](#commandcontext)\<`MergeGunshiExtensions`\<`G`, `L`\>\>\>) =\> `Promise`\<`string`\>, `ctx`: `Readonly`\<[`CommandContext`](#commandcontext)\<`MergeGunshiExtensions`\<`G`, `L`\>\>\>) =\> `Promise`\<`string`\> | A decorator function that wraps the base usage renderer. |

###### Returns

`void`

---

##### decorateValidationErrorsRenderer()

```ts
decorateValidationErrorsRenderer<
    L extends Record<string, unknown> = DefaultGunshiParams['extensions']
  >(decorator: (
      baseRenderer: (
        ctx: Readonly<CommandContext<MergeGunshiExtensions<G, L>>>,
        error: AggregateError
      ) => Promise<string>,
      ctx: Readonly<CommandContext<MergeGunshiExtensions<G, L>>>,
      error: AggregateError
    ) => Promise<string>): void;
```

Decorate the validation errors renderer.

###### Type Parameters

| Name                                                                                                    | Description                                                                                  |
| ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `L` _extends_ `Record<string, unknown>` = [`DefaultGunshiParams`](#defaultgunshiparams)\['extensions'\] | An extensions type to specify the shape of [`CommandContext`](#commandcontext)'s extensions. |

###### Parameters

| Name        | Type                                                                                                                                                                                                                                                                                                                           | Description                                                          |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `decorator` | (`baseRenderer`: (`ctx`: `Readonly`\<[`CommandContext`](#commandcontext)\<`MergeGunshiExtensions`\<`G`, `L`\>\>\>, `error`: `AggregateError`) =\> `Promise`\<`string`\>, `ctx`: `Readonly`\<[`CommandContext`](#commandcontext)\<`MergeGunshiExtensions`\<`G`, `L`\>\>\>, `error`: `AggregateError`) =\> `Promise`\<`string`\> | A decorator function that wraps the base validation errors renderer. |

###### Returns

`void`

---

##### hasCommand()

```ts
hasCommand(name: string): boolean;
```

Check if a command exists.

###### Parameters

| Name   | Type     | Description  |
| ------ | -------- | ------------ |
| `name` | `string` | Command name |

###### Returns

`boolean` — True if the command exists, false otherwise

### PluginDependency

Plugin dependency definition

#### Since

v0.27.0

#### Signature

```ts
export interface PluginDependency
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L81-L91)

#### Properties

| Name                    | Type      | Description                                                                                            |
| ----------------------- | --------- | ------------------------------------------------------------------------------------------------------ |
| `id`                    | `string`  | Dependency plugin id                                                                                   |
| `optional` _(optional)_ | `boolean` | Optional dependency flag. If `true`, the plugin will not throw an error if the dependency is not found |

### PluginExtension

Plugin extension

#### Since

v0.27.0

#### Signature

```ts
export type PluginExtension<
  T = Record<string, unknown>,
  G extends GunshiParams = DefaultGunshiParams
> = (ctx: CommandContextCore<G>, cmd: Command<G>) => Awaitable<T>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L116-L119)

#### Type Parameters

| Name                                                                                          | Description                                                                                                           |
| --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `T` = `Record<string, unknown>`                                                               | The type of the extension object returned by the plugin extension function.                                           |
| `G` _extends_ [`GunshiParams`](#gunshiparams) = [`DefaultGunshiParams`](#defaultgunshiparams) | A type extending [`GunshiParams`](#gunshiparams) to specify the shape of [`CommandContextCore`](#commandcontextcore). |

#### Parameters

| Name  | Type                                               | Description                                                    |
| ----- | -------------------------------------------------- | -------------------------------------------------------------- |
| `ctx` | [`CommandContextCore`](#commandcontextcore)\<`G`\> | The [`command context`](#commandcontextcore) core              |
| `cmd` | [`Command`](#command)\<`G`\>                       | The [`command`](#command) to which the plugin is being applied |

#### Returns

[`Awaitable`](#awaitable)\<`T`\> — An object of type T that represents the extension provided by the plugin

### PluginFunction

Plugin function type

#### Since

v0.27.0

#### Signature

```ts
export type PluginFunction<G extends GunshiParams = DefaultGunshiParams> = (
  ctx: Readonly<PluginContext<G>>
) => Awaitable<void>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L100-L102)

#### Type Parameters

| Name                                                                                          | Description                                                                                        |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `G` _extends_ [`GunshiParams`](#gunshiparams) = [`DefaultGunshiParams`](#defaultgunshiparams) | A type extending [`GunshiParams`](#gunshiparams) to specify the [`PluginContext`](#plugincontext). |

#### Parameters

| Name  | Type                                                   | Description |
| ----- | ------------------------------------------------------ | ----------- |
| `ctx` | `Readonly`\<[`PluginContext`](#plugincontext)\<`G`\>\> |             |

#### Returns

[`Awaitable`](#awaitable)\<`void`\>

### PluginOptions

Plugin definition options

#### Since

v0.27.0

#### Signature

```ts
export interface PluginOptions<
  DepExt extends ExtendContext = DefaultGunshiParams['extensions'], // for plugin dependency extensions
  Id extends string = string, // for plugin id
  Deps extends ReadonlyArray<PluginDependency | string> = (PluginDependency | string)[], // for plugin dependencies
  Ext extends Record<string, unknown> = {}, // for plugin extension type
  ResolvedDepExt extends GunshiParams = DependencyParams<Deps, DepExt>,
  PluginExt extends PluginExtension<Ext, ResolvedDepExt> = PluginExtension<Ext, ResolvedDepExt>,
  MergedExt extends GunshiParams = MergedPluginParams<
    Id,
    Deps,
    DepExt,
    Awaited<ReturnType<PluginExt>>
  >
>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L205-L243)

#### Type Parameters

| Name                                                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DepExt` _extends_ [`ExtendContext`](#extendcontext) = [`DefaultGunshiParams`](#defaultgunshiparams)\['extensions'\]                                      |
| `Id` _extends_ `string` = `string`                                                                                                                        |
| `Deps` _extends_ `ReadonlyArray`\<[`PluginDependency`](#plugindependency) \| `string`\> = ([`PluginDependency`](#plugindependency) \| `string`)\[\]       |
| `Ext` _extends_ `Record<string, unknown>` = `{}`                                                                                                          |
| `ResolvedDepExt` _extends_ [`GunshiParams`](#gunshiparams) = `DependencyParams<Deps, DepExt>`                                                             |
| `PluginExt` _extends_ [`PluginExtension`](#pluginextension)\<`Ext`, `ResolvedDepExt`\> = [`PluginExtension`](#pluginextension)\<`Ext`, `ResolvedDepExt`\> |
| `MergedExt` _extends_ [`GunshiParams`](#gunshiparams) = `MergedPluginParams<Id, Deps, DepExt, Awaited<ReturnType<PluginExt>>>`                            |

#### Properties

| Name                        | Type                                                     | Description                                                       |
| --------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------- |
| `dependencies` _(optional)_ | `Deps`                                                   | Plugin dependencies                                               |
| `extension` _(optional)_    | `PluginExt`                                              | Plugin extension                                                  |
| `id`                        | `Id`                                                     | Plugin unique identifier                                          |
| `name` _(optional)_         | `string`                                                 | Plugin name                                                       |
| `onExtension` _(optional)_  | [`OnPluginExtension`](#onpluginextension)\<`MergedExt`\> | Callback for when the plugin is extended with `extension` option. |
| `setup` _(optional)_        | [`PluginFunction`](#pluginfunction)\<`MergedExt`\>       | Plugin setup function                                             |

##### onExtension Parameters

| Name  | Type                                                     | Description |
| ----- | -------------------------------------------------------- | ----------- |
| `ctx` | `Readonly`\<[`CommandContext`](#commandcontext)\<`G`\>\> |             |
| `cmd` | `Readonly`\<[`Command`](#command)\<`G`\>\>               |             |

##### onExtension Returns

[`Awaitable`](#awaitable)\<`void`\>

##### setup Parameters

| Name  | Type                                                   | Description |
| ----- | ------------------------------------------------------ | ----------- |
| `ctx` | `Readonly`\<[`PluginContext`](#plugincontext)\<`G`\>\> |             |

##### setup Returns

[`Awaitable`](#awaitable)\<`void`\>

### PluginWithExtension

Plugin return type with extension, which includes the plugin ID, name, dependencies, and extension.

This type is used to define a plugin at `plugin` function.

#### Extends

- [`Plugin`](#plugin)\<`E`\>

#### Signature

```ts
export interface PluginWithExtension<
  E extends GunshiParams['extensions'] = DefaultGunshiParams['extensions']
> extends Plugin<E>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L270-L289)

#### Type Parameters

| Name                                                                                                                          | Description                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `E` _extends_ [`GunshiParams`](#gunshiparams)\['extensions'\] = [`DefaultGunshiParams`](#defaultgunshiparams)\['extensions'\] | A type extending [GunshiParams](#gunshiparams) to specify the shape of [`CommandContext`](#commandcontext)'s extensions. |

#### Properties

| Name                        | Type                                                         | Description         |
| --------------------------- | ------------------------------------------------------------ | ------------------- |
| `dependencies` _(optional)_ | ([`PluginDependency`](#plugindependency) \| `string`)\[\]    | Plugin dependencies |
| `extension`                 | [`CommandContextExtension`](#commandcontextextension)\<`E`\> | Plugin extension    |
| `id`                        | `string`                                                     | Plugin identifier   |
| `name`                      | `string`                                                     | Plugin name         |

### PluginWithoutExtension

Plugin return type without extension, which includes the plugin ID, name, and dependencies, but no extension.

This type is used to define a plugin at `plugin` function without extension.

#### Extends

- [`Plugin`](#plugin)\<`E`\>

#### Signature

```ts
export interface PluginWithoutExtension<
  E extends GunshiParams['extensions'] = DefaultGunshiParams['extensions']
> extends Plugin<E>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L298-L313)

#### Type Parameters

| Name                                                                                                                          | Description                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `E` _extends_ [`GunshiParams`](#gunshiparams)\['extensions'\] = [`DefaultGunshiParams`](#defaultgunshiparams)\['extensions'\] | A type extending [GunshiParams](#gunshiparams) to specify the shape of [`CommandContext`](#commandcontext)'s extensions. |

#### Properties

| Name                        | Type                                                      | Description         |
| --------------------------- | --------------------------------------------------------- | ------------------- |
| `dependencies` _(optional)_ | ([`PluginDependency`](#plugindependency) \| `string`)\[\] | Plugin dependencies |
| `id`                        | `string`                                                  | Plugin identifier   |
| `name`                      | `string`                                                  | Plugin name         |

### Prettify

Prettify a type by flattening its structure.

#### Signature

```ts
export type Prettify<T> = { [K in keyof T]: T[K] } & {}
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L23)

#### Type Parameters

| Name | Description                |
| ---- | -------------------------- |
| `T`  | The type to be prettified. |

### RendererDecorator

Renderer decorator type.

A function that wraps a base renderer to add or modify its behavior.

#### Since

v0.27.0

#### Signature

```ts
export type RendererDecorator<T, G extends GunshiParamsConstraint = DefaultGunshiParams> = (
  baseRenderer: (ctx: Readonly<CommandContext<G>>) => Promise<T>,
  ctx: Readonly<CommandContext<G>>
) => Promise<T>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L778-L781)

#### Type Parameters

| Name                                                                                                              | Description                                                                               |
| ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `T`                                                                                                               | The type of the rendered result.                                                          |
| `G` _extends_ [`GunshiParamsConstraint`](#gunshiparamsconstraint) = [`DefaultGunshiParams`](#defaultgunshiparams) | A type extending [`GunshiParams`](#gunshiparams) to specify the shape of command context. |

#### Parameters

| Name           | Type                                                                                   | Description                            |
| -------------- | -------------------------------------------------------------------------------------- | -------------------------------------- |
| `baseRenderer` | (`ctx`: `Readonly`\<[`CommandContext`](#commandcontext)\<`G`\>\>) =\> `Promise`\<`T`\> | The base renderer function to decorate |
| `ctx`          | `Readonly`\<[`CommandContext`](#commandcontext)\<`G`\>\>                               | The command context                    |

#### Returns

`Promise<T>` — The decorated result

### ValidationErrorsDecorator

Validation errors renderer decorator type.
A function that wraps a validation errors renderer to add or modify its behavior.

#### Since

v0.27.0

#### Signature

```ts
export type ValidationErrorsDecorator<G extends GunshiParamsConstraint = DefaultGunshiParams> = (
  baseRenderer: (ctx: Readonly<CommandContext<G>>, error: AggregateError) => Promise<string>,
  ctx: Readonly<CommandContext<G>>,
  error: AggregateError
) => Promise<string>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L796-L800)

#### Type Parameters

| Name                                                                                                              | Description                                                                               |
| ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `G` _extends_ [`GunshiParamsConstraint`](#gunshiparamsconstraint) = [`DefaultGunshiParams`](#defaultgunshiparams) | A type extending [`GunshiParams`](#gunshiparams) to specify the shape of command context. |

#### Parameters

| Name           | Type                                                                                                                   | Description                                              |
| -------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `baseRenderer` | (`ctx`: `Readonly`\<[`CommandContext`](#commandcontext)\<`G`\>\>, `error`: `AggregateError`) =\> `Promise`\<`string`\> | The base validation errors renderer function to decorate |
| `ctx`          | `Readonly`\<[`CommandContext`](#commandcontext)\<`G`\>\>                                                               | The command context                                      |
| `error`        | `AggregateError`                                                                                                       | The aggregate error containing validation errors         |

#### Returns

`Promise<string>` — The decorated result
