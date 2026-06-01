# PluginWithoutExtension

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

| Name                                                                             | Description                                                                                                                                                                        |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `E` _extends_ `GunshiParams['extensions']` = `DefaultGunshiParams['extensions']` | A type extending [GunshiParams](/api-ox/default/interfaces/GunshiParams.md) to specify the shape of [`CommandContext`](/api-ox/default/interfaces/CommandContext.md)'s extensions. |

## Properties

| Name                        | Kind     | Type        | Description         |
| --------------------------- | -------- | ----------- | ------------------- |
| `id`                        | property | `string`    | Plugin identifier   |
| `name`                      | property | `string`    | Plugin name         |
| `dependencies` _(optional)_ | property | `unknown[]` | Plugin dependencies |
