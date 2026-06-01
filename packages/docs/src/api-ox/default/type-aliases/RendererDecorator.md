# RendererDecorator

Renderer decorator type.

A function that wraps a base renderer to add or modify its behavior.

## Signature

```ts
export type RendererDecorator<T, G extends GunshiParamsConstraint = DefaultGunshiParams> = (
  baseRenderer: (ctx: Readonly<CommandContext<G>>) => Promise<T>,
  ctx: Readonly<CommandContext<G>>
) => Promise<T>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L778-L781)

## Type Parameters

| Name                                                           | Description                                                                                                            |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `T`                                                            | The type of the rendered result.                                                                                       |
| `G` _extends_ `GunshiParamsConstraint` = `DefaultGunshiParams` | A type extending [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) to specify the shape of command context. |

## Parameters

| Name           | Type      | Description                            |
| -------------- | --------- | -------------------------------------- |
| `baseRenderer` | `unknown` | The base renderer function to decorate |
| `ctx`          | `unknown` | The command context                    |

## Returns

`unknown` — The decorated result

## Tags

- `@since` — v0.27.0
