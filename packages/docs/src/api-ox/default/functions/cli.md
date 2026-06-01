# cli

Run the command.

## Signature

```ts
export async function cli<G extends GunshiParams = DefaultGunshiParams>(
  args: string[],
  entry: Command<G> | CommandRunner<G> | LazyCommand<G>,
  options: CliOptions<G> = {}
): Promise<string | undefined>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/cli/builtin.ts#L126-L133)

## Type Parameters

| Name                                                 | Description                                                                                                                    |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `G` _extends_ `GunshiParams` = `DefaultGunshiParams` | A type extending [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) to specify the shape of command and cli options. |

## Parameters

| Name      | Type                                               | Description                                                                                                                                                                                                    |
| --------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `args`    | `string[]`                                         | Command line arguments                                                                                                                                                                                         |
| `entry`   | `Command<G> \| CommandRunner<G> \| LazyCommand<G>` | A [entry command](/api-ox/default/interfaces/Command.md), an [inline command runner](/api-ox/default/type-aliases/CommandRunner.md), or a [lazily-loaded command](/api-ox/default/type-aliases/LazyCommand.md) |
| `options` | `CliOptions<G>`                                    | A [CLI options](/api-ox/default/interfaces/CliOptions.md) _(optional, default: {})_                                                                                                                            |

## Returns

`Promise<string \| undefined>` — A rendered usage or undefined. if you will use [`CliOptions.usageSilent`](/api-ox/default/interfaces/CliOptions.md#property-usagesilent) option, it will return rendered usage string.
