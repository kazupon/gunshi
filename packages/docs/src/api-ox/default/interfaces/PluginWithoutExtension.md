# Interface: PluginWithoutExtension\<E\>

Plugin return type without extension, which includes the plugin ID, name, and dependencies, but no extension.

This type is used to define a plugin at `plugin` function without extension.

## Signature

```ts
export interface PluginWithoutExtension<
  E extends GunshiParams['extensions'] = DefaultGunshiParams['extensions']
> extends Plugin<E>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L298-L313)

## Type Parameters

| Name                                                                                                                                                                                      | Description                                                                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `E` _extends_ [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md)\['extensions'\] = [`DefaultGunshiParams`](/api-ox/default/type-aliases/DefaultGunshiParams.md)\['extensions'\] | A type extending [GunshiParams](/api-ox/default/interfaces/GunshiParams.md) to specify the shape of [`CommandContext`](/api-ox/default/interfaces/CommandContext.md)'s extensions. |

## Properties

| Name                        | Type                                                | Description         |
| --------------------------- | --------------------------------------------------- | ------------------- |
| `dependencies` _(optional)_ | `unknown[]`                                         | Plugin dependencies |
| `id`                        | [`string`](/api-ox/combinators/functions/string.md) | Plugin identifier   |
| `name`                      | [`string`](/api-ox/combinators/functions/string.md) | Plugin name         |
