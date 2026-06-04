# Interface: PluginOptions\<DepExt, Id, Deps, Ext, ResolvedDepExt, PluginExt, MergedExt\>

Plugin definition options

## Since

v0.27.0

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

| Name                                                                                                                                                                                                                                                                                                | Description |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `DepExt` _extends_ [`ExtendContext`](/api-ox/default/type-aliases/ExtendContext.md) = [`DefaultGunshiParams`](/api-ox/default/type-aliases/DefaultGunshiParams.md)\['extensions'\]                                                                                                                  |             |
| `Id` _extends_ [`string`](/api-ox/combinators/functions/string.md) = [`string`](/api-ox/combinators/functions/string.md)                                                                                                                                                                            |             |
| `Deps` _extends_ `ReadonlyArray`\<[`PluginDependency`](/api-ox/default/interfaces/PluginDependency.md) \| [`string`](/api-ox/combinators/functions/string.md)\> = ([`PluginDependency`](/api-ox/default/interfaces/PluginDependency.md) \| [`string`](/api-ox/combinators/functions/string.md))\[\] |             |
| `Ext` _extends_ `Record`\<[`string`](/api-ox/combinators/functions/string.md), `unknown`\> = `{}`                                                                                                                                                                                                   |             |
| `ResolvedDepExt` _extends_ [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) = `DependencyParams<Deps, DepExt>`                                                                                                                                                                          |             |
| `PluginExt` _extends_ [`PluginExtension`](/api-ox/default/type-aliases/PluginExtension.md)\<`Ext`, `ResolvedDepExt`\> = [`PluginExtension`](/api-ox/default/type-aliases/PluginExtension.md)\<`Ext`, `ResolvedDepExt`\>                                                                             |             |
| `MergedExt` _extends_ [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) = `MergedPluginParams< Id, Deps, DepExt, Awaited<ReturnType<PluginExt>> >`                                                                                                                                       |             |

## Properties

| Name                        | Type                                                                                    | Description                                                       |
| --------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `dependencies` _(optional)_ | `Deps`                                                                                  | Plugin dependencies                                               |
| `extension` _(optional)_    | `PluginExt`                                                                             | Plugin extension                                                  |
| `id`                        | `Id`                                                                                    | Plugin unique identifier                                          |
| `name` _(optional)_         | [`string`](/api-ox/combinators/functions/string.md)                                     | Plugin name                                                       |
| `onExtension` _(optional)_  | [`OnPluginExtension`](/api-ox/default/type-aliases/OnPluginExtension.md)\<`MergedExt`\> | Callback for when the plugin is extended with `extension` option. |
| `setup` _(optional)_        | [`PluginFunction`](/api-ox/default/type-aliases/PluginFunction.md)\<`MergedExt`\>       | Plugin setup function                                             |
