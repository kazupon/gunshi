# Commandable

Define a command type.

## Signature

```ts
export type Commandable<G extends GunshiParamsConstraint = DefaultGunshiParams> =
  | Command<G>
  | LazyCommand<G, {}>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L644-L646)

## Type Parameters

| Name                                                           | Description                                                                                                    |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `G` _extends_ `GunshiParamsConstraint` = `DefaultGunshiParams` | A type extending [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) to specify the shape of command. |
