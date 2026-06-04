# Function: generate()

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

| Name                                                                                                                                                                            | Description                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `G` _extends_ [`GunshiParamsConstraint`](/api-ox/default/type-aliases/GunshiParamsConstraint.md) = [`DefaultGunshiParams`](/api-ox/default/type-aliases/DefaultGunshiParams.md) | A type extending [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) to specify the shape of command parameters. |

## Parameters

| Name      | Type                                                                                                                             | Description                                                                                                                                        |
| --------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `command` | [`string`](/api-ox/combinators/functions/string.md) \| [`string`](/api-ox/combinators/functions/string.md)\[\] \| `null`         | usage generate command, if you want to generate the usage of the default command where there are target commands and sub-commands, specify `null`. |
| `entry`   | [`Command`](/api-ox/default/interfaces/Command.md)\<`G`\> \| [`LazyCommand`](/api-ox/default/type-aliases/LazyCommand.md)\<`G`\> | A [`entry command`](/api-ox/default/interfaces/Command.md)                                                                                         |
| `options` | [`GenerateOptions`](/api-ox/generator/type-aliases/GenerateOptions.md)\<`G`\>                                                    | A [`cli options`](/api-ox/generator/type-aliases/GenerateOptions.md) _(optional, default: {})_                                                     |

## Returns

`Promise`\<[`string`](/api-ox/combinators/functions/string.md)\> — A rendered usage.
