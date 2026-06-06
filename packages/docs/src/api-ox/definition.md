# definition

**[Source](https://github.com/kazupon/gunshi/blob/main/definition)**

> 19 documented symbols. Read the signatures first, then expand each item for parameters, return types, and examples.

## Reference

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

### Command

Command interface.

#### Signature

```ts
export interface Command<G extends GunshiParamsConstraint = DefaultGunshiParams>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L553-L613)

#### Type Parameters

| Name                                                                                                                                | Description                      |
| ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `G` _extends_ [`GunshiParamsConstraint`](/api-ox/default.md#gunshiparamsconstraint) = [`DefaultGunshiParams`](#defaultgunshiparams) | The Gunshi parameters constraint |

#### Properties

| Name                       | Type                                                                                                                                                    | Description                                                                                                                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `args` _(optional)_        | `ExtractArgs<G>`                                                                                                                                        | Command arguments. Each argument can include a description property to describe the argument in usage.                                                                                     |
| `description` _(optional)_ | `string`                                                                                                                                                | Command description. It's used to describe the command in usage and it's recommended to specify.                                                                                           |
| `entry` _(optional)_       | `boolean`                                                                                                                                               | Whether this command is an entry command. **Since** v0.27.0                                                                                                                                |
| `examples` _(optional)_    | `string` \| [`CommandExamplesFetcher`](/api-ox/default.md#commandexamplesfetcher)\<`G`\>                                                                | Command examples. examples of how to use the command.                                                                                                                                      |
| `internal` _(optional)_    | `boolean`                                                                                                                                               | Whether this is an internal command. Internal commands are not shown in help usage. **Since** v0.27.0                                                                                      |
| `name` _(optional)_        | `string`                                                                                                                                                | Command name. It's used to find command line arguments to execute from sub commands, and it's recommended to specify.                                                                      |
| `rendering` _(optional)_   | [`RenderingOptions`](/api-ox/default.md#renderingoptions)\<`G`\>                                                                                        | Rendering control options **Since** v0.27.0                                                                                                                                                |
| `run` _(optional)_         | [`CommandRunner`](#commandrunner)\<`G`\>                                                                                                                | Command runner. it's the command to be executed                                                                                                                                            |
| `subCommands` _(optional)_ | `Record`\<`string`, [`SubCommandable`](/api-ox/default.md#subcommandable)\> \| `Map`\<`string`, [`SubCommandable`](/api-ox/default.md#subcommandable)\> | Nested sub-commands for this command. Allows building command trees like `git remote add`. Each key is the sub-command name, and the value is a command or lazy command. **Since** v0.28.0 |
| `toKebab` _(optional)_     | `boolean`                                                                                                                                               | Whether to convert the camel-case style argument name to kebab-case. If you will set to `true`, All [`Command.args`](#command-args) names will be converted to kebab-case.                 |

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

| Name                                                                                                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `G` _extends_ [`GunshiParams`](#gunshiparams) \| { [`args`](/api-ox/combinators.md#args): [`Args`](#args) } \| { `extensions`: [`ExtendContext`](#extendcontext) }                                          |
| `V` _extends_ [`ArgValues`](#argvalues)\<`ExtractArgs`\<`G`\>\>                                                                                                                                             |
| `C` _extends_ [`Command`](#command)\<`G`\> \| [`LazyCommand`](#lazycommand)\<`G`\> = [`Command`](#command)\<`G`\>                                                                                           |
| `E` _extends_ `Record`\<`string`, [`CommandContextExtension`](/api-ox/default.md#commandcontextextension)\> = `Record`\<`string`, [`CommandContextExtension`](/api-ox/default.md#commandcontextextension)\> |

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
| `tokens` _(optional)_          | [`ArgToken`](/api-ox/default.md#argtoken)\[\]           | Argument tokens that are parsed by the `parseArgs` function            |
| `validationError` _(optional)_ | `AggregateError`                                        | Validation error from argument parsing.                                |
| `values` _(optional)_          | `V`                                                     | A values of target command                                             |

### CommandLoader

Command loader.

A function that returns a command or command runner.
This is used to lazily load commands.

#### Signature

```ts
export type CommandLoader<G extends GunshiParamsConstraint = DefaultGunshiParams> = () => Awaitable<
  Command<G> | CommandRunner<G>
>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L744-L746)

#### Type Parameters

| Name                                                                                                                                | Description                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `G` _extends_ [`GunshiParamsConstraint`](/api-ox/default.md#gunshiparamsconstraint) = [`DefaultGunshiParams`](#defaultgunshiparams) | A type extending [`GunshiParams`](#gunshiparams) to specify the shape of command context and command runner. |

#### Returns

[`Awaitable`](/api-ox/default.md#awaitable)\<[`Command`](#command)\<`G`\> | [`CommandRunner`](#commandrunner)\<`G`\>\> — A command or command runner

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

| Name                                                                                                                                | Description                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `G` _extends_ [`GunshiParamsConstraint`](/api-ox/default.md#gunshiparamsconstraint) = [`DefaultGunshiParams`](#defaultgunshiparams) | A type extending [`GunshiParams`](#gunshiparams) to specify the shape of command context. |

#### Parameters

| Name  | Type                                                                       | Description                                            |
| ----- | -------------------------------------------------------------------------- | ------------------------------------------------------ |
| `ctx` | `Readonly`\<[`CommandContext`](/api-ox/default.md#commandcontext)\<`G`\>\> | A [command context](/api-ox/default.md#commandcontext) |

#### Returns

[`Awaitable`](/api-ox/default.md#awaitable)\<`string` | `void`\> — void or string (for CLI output)

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

| Name                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------- |
| `G` _extends_ [`GunshiParamsConstraint`](/api-ox/default.md#gunshiparamsconstraint) = [`DefaultGunshiParams`](#defaultgunshiparams) |
| `V` _extends_ [`ArgValues`](#argvalues)\<`ExtractArgs`\<`G`\>\> = [`ArgValues`](#argvalues)\<`ExtractArgs`\<`G`\>\>                 |
| `C` _extends_ [`Command`](#command)\<`G`\> \| [`LazyCommand`](#lazycommand)\<`G`\> = [`Command`](#command)\<`G`\>                   |
| `E` _extends_ `Record`\<`string`, [`CommandContextExtension`](/api-ox/default.md#commandcontextextension)\> = `{}`                  |

#### Parameters

| Name    | Type                                                                  | Description                                                        |
| ------- | --------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `param` | [`CommandContextParams`](#commandcontextparams)\<`G`, `V`, `C`, `E`\> | A [parameters](#commandcontextparams) to create a command context. |

#### Returns

`Promise<CommandContextResult<G, E>>` — A [command context](/api-ox/default.md#commandcontext), which is readonly.

### DefaultGunshiParams

Default Gunshi parameters.

#### Since

v0.27.0

#### Signature

```ts
export type DefaultGunshiParams = GunshiParams
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L67)

### define

Define a [command](#command).

#### Signature

```ts
export function define<
  G extends GunshiParamsConstraint = DefaultGunshiParams,
  A extends Args = ExtractArgs<G>,
  C extends Partial<Command<{ args: A; extensions: ExtractExtensions<G> }>> = {}
>(definition: CommandDefinition<A, ExtractExtensions<G>, C>): CommandDefinitionResult<G, C>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/definition.ts#L121-L125)

#### Type Parameters

| Name                                                                                                                                                | Description                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `G` _extends_ [`GunshiParamsConstraint`](/api-ox/default.md#gunshiparamsconstraint) = [`DefaultGunshiParams`](#defaultgunshiparams)                 | A [GunshiParamsConstraint](/api-ox/default.md#gunshiparamsconstraint) type                                   |
| `A` _extends_ [`Args`](#args) = `ExtractArgs<G>`                                                                                                    | An [Args](#args) type extracted from [GunshiParamsConstraint](/api-ox/default.md#gunshiparamsconstraint)     |
| `C` _extends_ `Partial`\<[`Command`](#command)\<{ [`args`](/api-ox/combinators.md#args): `A`; `extensions`: `ExtractExtensions`\<`G`\> }\>\> = `{}` | A [Command](#command) type inferred from [GunshiParamsConstraint](/api-ox/default.md#gunshiparamsconstraint) |

#### Parameters

| Name         | Type                                            | Description                      |
| ------------ | ----------------------------------------------- | -------------------------------- |
| `definition` | `CommandDefinition<A, ExtractExtensions<G>, C>` | A [command](#command) definition |

#### Returns

`CommandDefinitionResult<G, C>` — A defined [command](#command)

#### Examples

```ts
const command = define({
  name: 'test',
  description: 'A test command',
  args: {
    debug: {
      type: 'boolean',
      description: 'Enable debug mode',
      default: false
    }
  },
  run: ctx => {
    if (ctx.values.debug) {
      console.debug('Debug mode is enabled')
    }
  }
})
```

### define

Define a [command](#command).

#### Signature

```ts
export function define(definition: any): any
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/definition.ts#L135-L137)

#### Type Parameters

| Name | Description                                                                |
| ---- | -------------------------------------------------------------------------- |
| `G`  | A [GunshiParamsConstraint](/api-ox/default.md#gunshiparamsconstraint) type |

#### Parameters

| Name         | Type  | Description                      |
| ------------ | ----- | -------------------------------- |
| `definition` | `any` | A [command](#command) definition |

#### Returns

`any` — A defined [command](#command)

### defineWithTypes

Define a [command](#command) with types

This helper function allows specifying the type parameter of [GunshiParams](#gunshiparams)
while inferring the [Args](#args) type, [ExtendContext](#extendcontext) type from the definition.

#### Since

v0.27.0

#### Signature

```ts
export function defineWithTypes<G extends GunshiParamsConstraint>(): DefineWithTypesReturn<
  ExtractExtensions<G>,
  ExtractArgs<G>
>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/definition.ts#L182-L201)

#### Type Parameters

| Name                                                                                | Description                          |
| ----------------------------------------------------------------------------------- | ------------------------------------ |
| `G` _extends_ [`GunshiParamsConstraint`](/api-ox/default.md#gunshiparamsconstraint) | A [GunshiParams](#gunshiparams) type |

#### Returns

`DefineWithTypesReturn<ExtractExtensions<G>, ExtractArgs<G>>` — A function that takes a command definition via [define](#define)

#### Examples

```ts
// Define a command with specific extensions type
type MyExtensions = { logger: { log: (message: string) => void } }

const command = defineWithTypes<{ extensions: MyExtensions }>()({
  name: 'greet',
  args: {
    name: { type: 'string' }
  },
  run: ctx => {
    // ctx.values is inferred as { name?: string }
    // ctx.extensions is MyExtensions
  }
})
```

### ExtendContext

Extend command context type. This type is used to extend the command context with additional properties at [`CommandContext.extensions`](/api-ox/default.md#commandcontext-extensions).

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

### lazy

Define a [lazy command](#lazycommand).

#### Signature

```ts
export function lazy<A extends Args>(
  loader: CommandLoader<{ args: A; extensions: {} }>
): LazyCommand<{ args: A; extensions: {} }, {}>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/definition.ts#L217-L219)

#### Type Parameters

| Name                          | Description           |
| ----------------------------- | --------------------- |
| `A` _extends_ [`Args`](#args) | An [Args](#args) type |

#### Parameters

| Name     | Type                                                                                                  | Description                        |
| -------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `loader` | [`CommandLoader`](#commandloader)\<{ [`args`](/api-ox/combinators.md#args): `A`; `extensions`: {} }\> | A [command loader](#commandloader) |

#### Returns

[`LazyCommand`](#lazycommand)\<{ [`args`](/api-ox/combinators.md#args): `A`; `extensions`: {} }, {}\> — A [lazy command](#lazycommand) with loader

#### Examples

```ts
// load command with dynamic importing
const test = lazy(() => import('./commands/test'))
```

### lazy

Define a [lazy command](#lazycommand) with definition.

#### Signature

```ts
export function lazy<
  G extends GunshiParamsConstraint = DefaultGunshiParams,
  A extends ExtractArgs<G> = ExtractArgs<G>,
  D extends Partial<Command<{ args: A; extensions: {} }>> = Partial<
    Command<{ args: A; extensions: {} }>
  >
>(
  loader: CommandLoader<{ args: A; extensions: {} }>,
  definition: D
): LazyCommand<{ args: A; extensions: {} }, D>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/definition.ts#L256-L265)

#### Type Parameters

| Name                                                                                                                                                                                                                          | Description                                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `G` _extends_ [`GunshiParamsConstraint`](/api-ox/default.md#gunshiparamsconstraint) = [`DefaultGunshiParams`](#defaultgunshiparams)                                                                                           | -                                             |
| `A` _extends_ `ExtractArgs<G>` = `ExtractArgs<G>`                                                                                                                                                                             | An [Args](#args) type                         |
| `D` _extends_ `Partial`\<[`Command`](#command)\<{ [`args`](/api-ox/combinators.md#args): `A`; `extensions`: {} }\>\> = `Partial`\<[`Command`](#command)\<{ [`args`](/api-ox/combinators.md#args): `A`; `extensions`: {} }\>\> | A partial [Command](#command) definition type |

#### Parameters

| Name         | Type                                                                                                  | Description                                                                   |
| ------------ | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `loader`     | [`CommandLoader`](#commandloader)\<{ [`args`](/api-ox/combinators.md#args): `A`; `extensions`: {} }\> | A [command loader](#commandloader) function that returns a command definition |
| `definition` | `D`                                                                                                   | An optional [command](#command) definition                                    |

#### Returns

[`LazyCommand`](#lazycommand)\<{ [`args`](/api-ox/combinators.md#args): `A`; `extensions`: {} }, `D`\> — A [lazy command](#lazycommand) that can be executed later

#### Examples

```ts
// define command without command runner
const testDefinition = define({
  name: 'test',
  description: 'Test command',
  args: {
    debug: {
      type: 'boolean',
      description: 'Enable debug mode',
      default: false
    }
  }
})

// define load command with command runner and defined command
const test = lazy((): CommandRunner<{ args: typeof testDefinition.args; extensions: {} }> => {
  return ctx => {
    if (ctx.values.debug) {
      console.debug('Debug mode is enabled')
    }
  }
}, testDefinition)
```

### lazy

Define a [lazy command](#lazycommand) with or without definition.

#### Signature

```ts
export function lazy<G extends GunshiParamsConstraint = DefaultGunshiParams>(
  loader: CommandLoader<G>,
  definition?: Partial<Command<G>>
): LazyCommand<G, any>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/definition.ts#L274-L299)

#### Type Parameters

| Name                                                                                                                                |
| ----------------------------------------------------------------------------------------------------------------------------------- |
| `G` _extends_ [`GunshiParamsConstraint`](/api-ox/default.md#gunshiparamsconstraint) = [`DefaultGunshiParams`](#defaultgunshiparams) |

#### Parameters

| Name         | Type                                      | Description                                                                   |
| ------------ | ----------------------------------------- | ----------------------------------------------------------------------------- |
| `loader`     | [`CommandLoader`](#commandloader)\<`G`\>  | A [command loader](#commandloader) function that returns a command definition |
| `definition` | `Partial`\<[`Command`](#command)\<`G`\>\> | An optional [command](#command) definition _(optional)_                       |

#### Returns

[`LazyCommand`](#lazycommand)\<`G`, `any`\> — A [lazy command](#lazycommand) that can be executed later

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

| Name                                                                                                                                | Description                                              |
| ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `G` _extends_ [`GunshiParamsConstraint`](/api-ox/default.md#gunshiparamsconstraint) = [`DefaultGunshiParams`](#defaultgunshiparams) | The Gunshi parameters constraint                         |
| `D` _extends_ `Partial`\<[`Command`](#command)\<`G`\>\> = `{}`                                                                      | The partial command definition provided to lazy function |

### lazyWithTypes

Define a [lazy command](#lazycommand) with specific type parameters.

This helper function allows specifying the type parameter of [GunshiParams](#gunshiparams)
while inferring the [Args](#args) type, [ExtendContext](#extendcontext) type from the definition.

#### Since

v0.27.0

#### Signature

```ts
export function lazyWithTypes<G extends GunshiParamsConstraint>(): LazyWithTypesReturn<
  NormalizeToGunshiParams<G>
>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/definition.ts#L349-L361)

#### Type Parameters

| Name                                                                                | Description                          |
| ----------------------------------------------------------------------------------- | ------------------------------------ |
| `G` _extends_ [`GunshiParamsConstraint`](/api-ox/default.md#gunshiparamsconstraint) | A [GunshiParams](#gunshiparams) type |

#### Returns

`LazyWithTypesReturn<NormalizeToGunshiParams<G>>` — A function that takes a lazy command definition via [lazy](#lazy)

#### Examples

```ts
type MyExtensions = { logger: { log: (message: string) => void } }

const command = lazyWithTypes<{ extensions: MyExtensions }>()(
  () => {
    return ctx => {
      // Command runner implementation
      ctx.extensions.logger?.log('Command executed')
  },
 {
  name: 'lazy-command',
  args: {
    opt: {
      type: 'string',
      description: 'An optional string argument',
      required: false,
    },
  },
)
```
