# Type Alias: PluginExtension\<T, G\>

Plugin extension

## Since

v0.27.0

## Signature

```ts
export type PluginExtension<
  T = Record<string, unknown>,
  G extends GunshiParams = DefaultGunshiParams
> = (ctx: CommandContextCore<G>, cmd: Command<G>) => Awaitable<T>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L116-L119)

## Type Parameters

| Name                                                                                                                                                      | Description                                                                                                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `T` = `Record`\<[`string`](/api-ox/combinators/functions/string.md), `unknown`\>                                                                          | The type of the extension object returned by the plugin extension function.                                                                                                       |
| `G` _extends_ [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) = [`DefaultGunshiParams`](/api-ox/default/type-aliases/DefaultGunshiParams.md) | A type extending [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) to specify the shape of [`CommandContextCore`](/api-ox/default/type-aliases/CommandContextCore.md). |

## Parameters

| Name  | Type      | Description                                                                                 |
| ----- | --------- | ------------------------------------------------------------------------------------------- |
| `ctx` | `unknown` | The [`command context`](/api-ox/default/type-aliases/CommandContextCore.md) core            |
| `cmd` | `unknown` | The [`command`](/api-ox/default/interfaces/Command.md) to which the plugin is being applied |

## Returns

`unknown` — An object of type T that represents the extension provided by the plugin
