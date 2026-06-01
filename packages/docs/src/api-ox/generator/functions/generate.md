# generate

Generate the command usage.

## Signature

```ts
export async function generate<G extends GunshiParamsConstraint = DefaultGunshiParams>(
  command: string | string[] | null,
  entry: Command<G> | LazyCommand<G>,
  options: GenerateOptions<G> = {}
): Promise<string>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/generator.ts#L45-L62)

## Type Parameters

| Name                                                           | Description                                                                                                               |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `G` _extends_ `GunshiParamsConstraint` = `DefaultGunshiParams` | A type extending [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) to specify the shape of command parameters. |

## Parameters

| Name      | Type                           | Description                                                                                                                                        |
| --------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `command` | `string \| string[] \| null`   | usage generate command, if you want to generate the usage of the default command where there are target commands and sub-commands, specify `null`. |
| `entry`   | `Command<G> \| LazyCommand<G>` | A [`entry command`](/api-ox/default/interfaces/Command.md)                                                                                         |
| `options` | `GenerateOptions<G>`           | A [`cli options`](/api-ox/generator/type-aliases/GenerateOptions.md) _(optional, default: {})_                                                     |

## Returns

`Promise<string>` — A rendered usage.
