# Type Alias: PluginFunction\<G\>

Plugin function type

## Since

v0.27.0

## Signature

```ts
export type PluginFunction<G extends GunshiParams = DefaultGunshiParams> = (
  ctx: Readonly<PluginContext<G>>
) => Awaitable<void>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L100-L102)

## Type Parameters

| Name                                                                                                                                                      | Description                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `G` _extends_ [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) = [`DefaultGunshiParams`](/api-ox/default/type-aliases/DefaultGunshiParams.md) | A type extending [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) to specify the [`PluginContext`](/api-ox/default/interfaces/PluginContext.md). |
