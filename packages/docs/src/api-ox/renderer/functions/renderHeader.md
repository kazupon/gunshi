# Function: renderHeader()

Render the header.

## Signature

```ts
declare function renderHeader<G extends GunshiParams = DefaultGunshiParams>(
  ctx: Readonly<CommandContext<G>>
): Promise<string>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/plugin-renderer/lib/index.d.ts#L161)

## Type Parameters

| Name                                                                                                                                                      | Description |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `G` _extends_ [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) = [`DefaultGunshiParams`](/api-ox/default/type-aliases/DefaultGunshiParams.md) |             |

## Parameters

| Name  | Type                                                                                  | Description                                                       |
| ----- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `ctx` | `Readonly`\<[`CommandContext`](/api-ox/default/interfaces/CommandContext.md)\<`G`\>\> | A [command context](/api-ox/default/interfaces/CommandContext.md) |

## Returns

`Promise`\<[`string`](/api-ox/combinators/functions/string.md)\> — A rendered header.
