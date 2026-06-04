# Type Alias: Plugin\<E\>

Gunshi plugin, which is a function that receives a PluginContext.

## Since

v0.27.0

## Signature

```ts
export type Plugin<E extends GunshiParams['extensions'] = DefaultGunshiParams['extensions']> =
  PluginFunction & {
    id: string
    name?: string
    dependencies?: (PluginDependency | string)[]
    extension?: CommandContextExtension<E>
  }
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L255-L261)

## Type Parameters

| Name                                                                                                                                                                                      | Description                                                                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `E` _extends_ [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md)\['extensions'\] = [`DefaultGunshiParams`](/api-ox/default/type-aliases/DefaultGunshiParams.md)\['extensions'\] | A type extending [GunshiParams](/api-ox/default/interfaces/GunshiParams.md) to specify the shape of [`CommandContext`](/api-ox/default/interfaces/CommandContext.md)'s extensions. |

## Parameters

| Name  | Type      | Description                                                       |
| ----- | --------- | ----------------------------------------------------------------- |
| `ctx` | `unknown` | A [`PluginContext`](/api-ox/default/interfaces/PluginContext.md). |

## Returns

`unknown` — An [`Awaitable`](/api-ox/default/type-aliases/Awaitable.md) that resolves when the plugin is loaded.
