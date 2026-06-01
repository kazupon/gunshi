# PluginWithExtension

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

| Name                                                                             | Description                                                                                                                                                                      |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `E` _extends_ `GunshiParams['extensions']` = `DefaultGunshiParams['extensions']` | A type extending [GunshiParams](/api-ox/plugin/interfaces/GunshiParams.md) to specify the shape of [`CommandContext`](/api-ox/plugin/interfaces/CommandContext.md)'s extensions. |

## Properties

| Name                        | Kind     | Type                         | Description         |
| --------------------------- | -------- | ---------------------------- | ------------------- |
| `id`                        | property | `string`                     | Plugin identifier   |
| `name`                      | property | `string`                     | Plugin name         |
| `dependencies` _(optional)_ | property | `unknown[]`                  | Plugin dependencies |
| `extension`                 | property | `CommandContextExtension<E>` | Plugin extension    |
