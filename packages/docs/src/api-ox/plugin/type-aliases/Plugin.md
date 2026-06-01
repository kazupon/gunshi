# Plugin

Gunshi plugin, which is a function that receives a PluginContext.

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

| Name                                                                             | Description                                                                                                                                                                      |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `E` _extends_ `GunshiParams['extensions']` = `DefaultGunshiParams['extensions']` | A type extending [GunshiParams](/api-ox/plugin/interfaces/GunshiParams.md) to specify the shape of [`CommandContext`](/api-ox/plugin/interfaces/CommandContext.md)'s extensions. |

## Parameters

| Name  | Type      | Description                                                      |
| ----- | --------- | ---------------------------------------------------------------- |
| `ctx` | `unknown` | A [`PluginContext`](/api-ox/plugin/interfaces/PluginContext.md). |

## Returns

`unknown` — An [`Awaitable`](/api-ox/plugin/type-aliases/Awaitable.md) that resolves when the plugin is loaded.

## Tags

- `@since` — v0.27.0
