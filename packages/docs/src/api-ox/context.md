# context

**[Source](https://github.com/kazupon/gunshi/blob/main/context)**

> 2 documented symbols. Read the signatures first, then expand each item for parameters, return types, and examples.

## Reference

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

| Name                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `G` _extends_ [`GunshiParams`](/api-ox/default.md#gunshiparams) \| { [`args`](/api-ox/combinators.md#args): [`Args`](/api-ox/default.md#args) } \| { `extensions`: [`ExtendContext`](/api-ox/default.md#extendcontext) } |
| `V` _extends_ [`ArgValues`](/api-ox/default.md#argvalues)\<`ExtractArgs`\<`G`\>\>                                                                                                                                        |
| `C` _extends_ [`Command`](/api-ox/default.md#command)\<`G`\> \| [`LazyCommand`](/api-ox/default.md#lazycommand)\<`G`\> = [`Command`](/api-ox/default.md#command)\<`G`\>                                                  |
| `E` _extends_ `Record`\<`string`, [`CommandContextExtension`](/api-ox/default.md#commandcontextextension)\> = `Record`\<`string`, [`CommandContextExtension`](/api-ox/default.md#commandcontextextension)\>              |

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

| Name                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `G` _extends_ [`GunshiParamsConstraint`](/api-ox/default.md#gunshiparamsconstraint) = [`DefaultGunshiParams`](/api-ox/default.md#defaultgunshiparams)                   |
| `V` _extends_ [`ArgValues`](/api-ox/default.md#argvalues)\<`ExtractArgs`\<`G`\>\> = [`ArgValues`](/api-ox/default.md#argvalues)\<`ExtractArgs`\<`G`\>\>                 |
| `C` _extends_ [`Command`](/api-ox/default.md#command)\<`G`\> \| [`LazyCommand`](/api-ox/default.md#lazycommand)\<`G`\> = [`Command`](/api-ox/default.md#command)\<`G`\> |
| `E` _extends_ `Record`\<`string`, [`CommandContextExtension`](/api-ox/default.md#commandcontextextension)\> = `{}`                                                      |

#### Parameters

| Name    | Type                                                                  | Description                                                        |
| ------- | --------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `param` | [`CommandContextParams`](#commandcontextparams)\<`G`, `V`, `C`, `E`\> | A [parameters](#commandcontextparams) to create a command context. |

#### Returns

`Promise<CommandContextResult<G, E>>` — A [command context](/api-ox/default.md#commandcontext), which is readonly.
