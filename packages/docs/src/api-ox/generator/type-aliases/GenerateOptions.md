# GenerateOptions

generate options of `generate` function.

## Signature

```ts
export type GenerateOptions<G extends GunshiParamsConstraint = DefaultGunshiParams> = CliOptions<G>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/generator.ts#L33)

## Type Parameters

| Name                                                           | Description                                                                                                                                                     |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `G` _extends_ `GunshiParamsConstraint` = `DefaultGunshiParams` | A type extending [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) to specify the shape of [`CliOptions`](/api-ox/default/interfaces/CliOptions.md). |
