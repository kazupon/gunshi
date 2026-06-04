# Interface: CommandContextExtension\<E\>

Command context extension

## Since

v0.27.0

## Signature

```ts
export interface CommandContextExtension<
  E extends GunshiParams['extensions'] = DefaultGunshiParams['extensions']
>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L496-L511)

## Type Parameters

| Name                                                                                                                                                                                      | Description                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `E` _extends_ [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md)\['extensions'\] = [`DefaultGunshiParams`](/api-ox/default/type-aliases/DefaultGunshiParams.md)\['extensions'\] | A type extending [`GunshiParams.extensions`](/api-ox/default/interfaces/GunshiParams.md#property-extensions) to specify the shape of the extension. |

## Properties

| Name                               | Type                                                                                                                                                                                                                                    | Description                         |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `factory` _(readonly)_             | (`ctx`: [`CommandContextCore`](/api-ox/default/type-aliases/CommandContextCore.md), `cmd`: [`Command`](/api-ox/default/interfaces/Command.md)) =\> [`Awaitable`](/api-ox/default/type-aliases/Awaitable.md)\<`E`\>                      | Plugin extension factory            |
| `key` _(readonly)_                 | `symbol`                                                                                                                                                                                                                                | Plugin identifier                   |
| `onFactory` _(optional, readonly)_ | (`ctx`: `Readonly`\<[`CommandContext`](/api-ox/default/interfaces/CommandContext.md)\>, `cmd`: `Readonly`\<[`Command`](/api-ox/default/interfaces/Command.md)\>) =\> [`Awaitable`](/api-ox/default/type-aliases/Awaitable.md)\<`void`\> | Plugin extension factory after hook |
