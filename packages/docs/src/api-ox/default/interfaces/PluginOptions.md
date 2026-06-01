# PluginOptions

Plugin definition options

## Signature

```ts
export interface PluginOptions<
  DepExt extends ExtendContext = DefaultGunshiParams['extensions'], // for plugin dependency extensions
  Id extends string = string, // for plugin id
  Deps extends ReadonlyArray<PluginDependency | string> = (PluginDependency | string)[], // for plugin dependencies
  Ext extends Record<string, unknown> = {}, // for plugin extension type
  ResolvedDepExt extends GunshiParams = DependencyParams<Deps, DepExt>,
  PluginExt extends PluginExtension<Ext, ResolvedDepExt> = PluginExtension<Ext, ResolvedDepExt>,
  MergedExt extends GunshiParams = MergedPluginParams<
    Id,
    Deps,
    DepExt,
    Awaited<ReturnType<PluginExt>>
  >
>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L205-L243)

## Type Parameters

| Name                                                                                                            | Description |
| --------------------------------------------------------------------------------------------------------------- | ----------- |
| `DepExt` _extends_ `ExtendContext` = `DefaultGunshiParams['extensions']`                                        |             |
| `Id` _extends_ `string` = `string`                                                                              |             |
| `Deps` _extends_ `ReadonlyArray<PluginDependency \| string>` = `(PluginDependency \| string)[]`                 |             |
| `Ext` _extends_ `Record<string, unknown>` = `{}`                                                                |             |
| `ResolvedDepExt` _extends_ `GunshiParams` = `DependencyParams<Deps, DepExt>`                                    |             |
| `PluginExt` _extends_ `PluginExtension<Ext, ResolvedDepExt>` = `PluginExtension<Ext, ResolvedDepExt>`           |             |
| `MergedExt` _extends_ `GunshiParams` = `MergedPluginParams< Id, Deps, DepExt, Awaited<ReturnType<PluginExt>> >` |             |

## Properties

| Name                        | Kind     | Type                           | Description                                                       |
| --------------------------- | -------- | ------------------------------ | ----------------------------------------------------------------- |
| `id`                        | property | `Id`                           | Plugin unique identifier                                          |
| `name` _(optional)_         | property | `string`                       | Plugin name                                                       |
| `dependencies` _(optional)_ | property | `Deps`                         | Plugin dependencies                                               |
| `setup` _(optional)_        | property | `PluginFunction<MergedExt>`    | Plugin setup function                                             |
| `extension` _(optional)_    | property | `PluginExt`                    | Plugin extension                                                  |
| `onExtension` _(optional)_  | property | `OnPluginExtension<MergedExt>` | Callback for when the plugin is extended with `extension` option. |

## Tags

- `@since` — v0.27.0
