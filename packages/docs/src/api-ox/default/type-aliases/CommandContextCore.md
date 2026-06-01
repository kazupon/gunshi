# CommandContextCore

Readonly command context available to a command context extension factory.

## Signature

```ts
export type CommandContextCore<G extends GunshiParamsConstraint = DefaultGunshiParams> = Readonly<
  CommandContext<G>
>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L485-L487)

## Type Parameters

| Name                                                           | Description                                                                                                            |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `G` _extends_ `GunshiParamsConstraint` = `DefaultGunshiParams` | A type extending [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) to specify the shape of command context. |

## Tags

- `@since` — v0.27.0
