# CommandContextParams

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

| Name                                                                                                | Description |
| --------------------------------------------------------------------------------------------------- | ----------- |
| `G` _extends_ `GunshiParams \| { args: Args } \| { extensions: ExtendContext }`                     |             |
| `V` _extends_ `ArgValues<ExtractArgs<G>>`                                                           |             |
| `C` _extends_ `Command<G> \| LazyCommand<G>` = `Command<G>`                                         |             |
| `E` _extends_ `Record<string, CommandContextExtension>` = `Record<string, CommandContextExtension>` |             |

## Properties

| Name                           | Kind     | Type                              | Description                                                            |
| ------------------------------ | -------- | --------------------------------- | ---------------------------------------------------------------------- |
| `args` _(optional)_            | property | `ExtractArgs<G>`                  | An arguments of target command                                         |
| `explicit` _(optional)_        | property | `ExtractArgExplicitlyProvided<G>` | Explicitly provided arguments                                          |
| `values` _(optional)_          | property | `V`                               | A values of target command                                             |
| `positionals` _(optional)_     | property | `string[]`                        | A positionals arguments, which passed to the target command            |
| `rest` _(optional)_            | property | `string[]`                        | A rest arguments, which passed to the target command                   |
| `argv` _(optional)_            | property | `string[]`                        | Original command line arguments                                        |
| `tokens` _(optional)_          | property | `ArgToken[]`                      | Argument tokens that are parsed by the `parseArgs` function            |
| `omitted` _(optional)_         | property | `boolean`                         | Whether the command is omitted                                         |
| `callMode` _(optional)_        | property | `CommandCallMode`                 | Command call mode.                                                     |
| `commandPath` _(optional)_     | property | `string[]`                        | The path of nested sub-commands resolved to reach the current command. |
| `command` _(optional)_         | property | `C`                               | A target command                                                       |
| `extensions` _(optional)_      | property | `E`                               | Plugin extensions to apply as the command context extension.           |
| `cliOptions` _(optional)_      | property | `CliOptions<G>`                   | A command options, which is spicialized from `cli` function            |
| `validationError` _(optional)_ | property | `AggregateError`                  | Validation error from argument parsing.                                |
