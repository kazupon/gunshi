# Interface: CommandContextParams\<G, V, C, E\>

Parameters of [createCommandContext](/api-ox/context/functions/createCommandContext.md)

## Signature

```ts
export interface CommandContextParams<
  G extends GunshiParams | { args: Args } | { extensions: ExtendContext },
  V extends ArgValues<ExtractArgs<G>>,
  C extends Command<G> | LazyCommand<G> = Command<G>,
  E extends Record<string, CommandContextExtension> = Record<string, CommandContextExtension>
>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/context.ts#L71-L135)

## Type Parameters

| Name                                                                                                                                                                                                                                                                                                                    | Description |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `G` _extends_ [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) \| { [`args`](/api-ox/combinators/functions/args.md): [`Args`](/api-ox/default/interfaces/Args.md) } \| { `extensions`: [`ExtendContext`](/api-ox/default/type-aliases/ExtendContext.md) }                                                   |             |
| `V` _extends_ [`ArgValues`](/api-ox/default/type-aliases/ArgValues.md)\<`ExtractArgs`\<`G`\>\>                                                                                                                                                                                                                          |             |
| `C` _extends_ [`Command`](/api-ox/default/interfaces/Command.md)\<`G`\> \| [`LazyCommand`](/api-ox/default/type-aliases/LazyCommand.md)\<`G`\> = [`Command`](/api-ox/default/interfaces/Command.md)\<`G`\>                                                                                                              |             |
| `E` _extends_ `Record`\<[`string`](/api-ox/combinators/functions/string.md), [`CommandContextExtension`](/api-ox/default/interfaces/CommandContextExtension.md)\> = `Record`\<[`string`](/api-ox/combinators/functions/string.md), [`CommandContextExtension`](/api-ox/default/interfaces/CommandContextExtension.md)\> |             |

## Properties

| Name                           | Type                                                                 | Description                                                            |
| ------------------------------ | -------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `args` _(optional)_            | `ExtractArgs<G>`                                                     | An arguments of target command                                         |
| `argv` _(optional)_            | [`string`](/api-ox/combinators/functions/string.md)\[\]              | Original command line arguments                                        |
| `callMode` _(optional)_        | [`CommandCallMode`](/api-ox/default/type-aliases/CommandCallMode.md) | Command call mode.                                                     |
| `cliOptions` _(optional)_      | [`CliOptions`](/api-ox/default/interfaces/CliOptions.md)\<`G`\>      | A command options, which is spicialized from `cli` function            |
| `command` _(optional)_         | `C`                                                                  | A target command                                                       |
| `commandPath` _(optional)_     | [`string`](/api-ox/combinators/functions/string.md)\[\]              | The path of nested sub-commands resolved to reach the current command. |
| `explicit` _(optional)_        | `ExtractArgExplicitlyProvided<G>`                                    | Explicitly provided arguments                                          |
| `extensions` _(optional)_      | `E`                                                                  | Plugin extensions to apply as the command context extension.           |
| `omitted` _(optional)_         | [`boolean`](/api-ox/combinators/functions/boolean.md)                | Whether the command is omitted                                         |
| `positionals` _(optional)_     | [`string`](/api-ox/combinators/functions/string.md)\[\]              | A positionals arguments, which passed to the target command            |
| `rest` _(optional)_            | [`string`](/api-ox/combinators/functions/string.md)\[\]              | A rest arguments, which passed to the target command                   |
| `tokens` _(optional)_          | [`ArgToken`](/api-ox/default/interfaces/ArgToken.md)\[\]             | Argument tokens that are parsed by the `parseArgs` function            |
| `validationError` _(optional)_ | `AggregateError`                                                     | Validation error from argument parsing.                                |
| `values` _(optional)_          | `V`                                                                  | A values of target command                                             |
