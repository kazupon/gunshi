# Interface: PluginWithExtension\<E\>

Plugin return type with extension, which includes the plugin ID, name, dependencies, and extension.

This type is used to define a plugin at `plugin` function.

## Signature

```ts
export interface PluginWithExtension<
  E extends GunshiParams['extensions'] = DefaultGunshiParams['extensions']
> extends Plugin<E>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L270-L289)

## Type Parameters

| Name                                                                                                                                                                                      | Description                                                                                                                                                                        |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `E` _extends_ [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md)\['extensions'\] = [`DefaultGunshiParams`](/api-ox/default/type-aliases/DefaultGunshiParams.md)\['extensions'\] | A type extending [GunshiParams](/api-ox/default/interfaces/GunshiParams.md) to specify the shape of [`CommandContext`](/api-ox/default/interfaces/CommandContext.md)'s extensions. |

## Properties

| Name                        | Type                                                                                      | Description         |
| --------------------------- | ----------------------------------------------------------------------------------------- | ------------------- |
| `dependencies` _(optional)_ | `unknown[]`                                                                               | Plugin dependencies |
| `extension`                 | [`CommandContextExtension`](/api-ox/default/interfaces/CommandContextExtension.md)\<`E`\> | Plugin extension    |
| `id`                        | [`string`](/api-ox/combinators/functions/string.md)                                       | Plugin identifier   |
| `name`                      | [`string`](/api-ox/combinators/functions/string.md)                                       | Plugin name         |
