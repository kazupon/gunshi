# generator

**[Source](https://github.com/kazupon/gunshi/blob/main/generator)**

> 2 documented symbols. Read the signatures first, then expand each item for parameters, return types, and examples.

## Reference

### generate

Generate the command usage.

#### Signature

```ts
export async function generate<G extends GunshiParamsConstraint = DefaultGunshiParams>(
  command: string | string[] | null,
  entry: Command<G> | LazyCommand<G>,
  options: GenerateOptions<G> = {}
): Promise<string>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/generator.ts#L45-L62)

#### Type Parameters

| Name                                                                                                                                                  | Description                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `G` _extends_ [`GunshiParamsConstraint`](/api-ox/default.md#gunshiparamsconstraint) = [`DefaultGunshiParams`](/api-ox/default.md#defaultgunshiparams) | A type extending [`GunshiParams`](/api-ox/default.md#gunshiparams) to specify the shape of command parameters. |

#### Parameters

| Name      | Type                                                                                                     | Description                                                                                                                                        |
| --------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `command` | `string \| string[] \| null`                                                                             | usage generate command, if you want to generate the usage of the default command where there are target commands and sub-commands, specify `null`. |
| `entry`   | [`Command`](/api-ox/default.md#command)\<`G`\> \| [`LazyCommand`](/api-ox/default.md#lazycommand)\<`G`\> | A [`entry command`](/api-ox/default.md#command)                                                                                                    |
| `options` | [`GenerateOptions`](#generateoptions)\<`G`\>                                                             | A [`cli options`](#generateoptions) _(optional, default: {})_                                                                                      |

#### Returns

`Promise<string>` — A rendered usage.

### GenerateOptions

generate options of `generate` function.

#### Signature

```ts
export type GenerateOptions<G extends GunshiParamsConstraint = DefaultGunshiParams> = CliOptions<G>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/generator.ts#L33)

#### Type Parameters

| Name                                                                                                                                                  | Description                                                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `G` _extends_ [`GunshiParamsConstraint`](/api-ox/default.md#gunshiparamsconstraint) = [`DefaultGunshiParams`](/api-ox/default.md#defaultgunshiparams) | A type extending [`GunshiParams`](/api-ox/default.md#gunshiparams) to specify the shape of [`CliOptions`](/api-ox/default.md#clioptions). |
