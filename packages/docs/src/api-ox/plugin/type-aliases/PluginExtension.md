# PluginExtension

Plugin extension

## Signature

```ts
export type PluginExtension<
  T = Record<string, unknown>,
  G extends GunshiParams = DefaultGunshiParams
> = (ctx: CommandContextCore<G>, cmd: Command<G>) => Awaitable<T>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L116-L119)

## Type Parameters

| Name                                                 | Description                                                                                                                                                                     |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `T` = `Record<string, unknown>`                      | The type of the extension object returned by the plugin extension function.                                                                                                     |
| `G` _extends_ `GunshiParams` = `DefaultGunshiParams` | A type extending [`GunshiParams`](/api-ox/plugin/interfaces/GunshiParams.md) to specify the shape of [`CommandContextCore`](/api-ox/plugin/type-aliases/CommandContextCore.md). |

## Parameters

| Name  | Type      | Description                                                                                |
| ----- | --------- | ------------------------------------------------------------------------------------------ |
| `ctx` | `unknown` | The [`command context`](/api-ox/plugin/type-aliases/CommandContextCore.md) core            |
| `cmd` | `unknown` | The [`command`](/api-ox/plugin/interfaces/Command.md) to which the plugin is being applied |

## Returns

`unknown` — An object of type T that represents the extension provided by the plugin

## Tags

- `@since` — v0.27.0
