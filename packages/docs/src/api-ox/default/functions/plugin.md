# Function: plugin()

Define a plugin

## Since

v0.27.0

## Call Signature

```ts
export function plugin<
  Context extends ExtendContext = DefaultGunshiParams['extensions'], // for plugin dependency extensions
  Id extends string = string, // for plugin id
  Deps extends ReadonlyArray<PluginDependency | string> = [], // for plugin dependencies
  Extension extends {} = {}, // for plugin extension type
  ResolvedDepExtensions extends GunshiParams = DependencyParams<Deps, Context>,
  PluginExt extends PluginExtension<Extension, DefaultGunshiParams> = PluginExtension<
    Extension,
    ResolvedDepExtensions
  >,
  MergedExtensions extends GunshiParams = MergedPluginParams<
    Id,
    Deps,
    Context,
    Awaited<ReturnType<PluginExt>>
  >
>(options: {
  id: Id
  name?: string
  dependencies?: Deps
  setup?: (
    ctx: Readonly<
      PluginContext<MergedPluginParams<Id, Deps, Context, Awaited<ReturnType<PluginExt>>>>
    >
  ) => Awaitable<void>
  extension: PluginExt
  onExtension?: OnPluginExtension<MergedExtensions>
}): PluginWithExtension<Awaited<ReturnType<PluginExt>>>
```

Define a plugin with extension compatibility and typed dependency extensions

### Since

v0.27.0

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L328-L355)

### Type Parameters

| Name                                                                                                                                                                                | Description                                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `Context` _extends_ [`ExtendContext`](/api-ox/default/type-aliases/ExtendContext.md) = [`DefaultGunshiParams`](/api-ox/default/type-aliases/DefaultGunshiParams.md)\['extensions'\] | A type extending [`ExtendContext`](/api-ox/default/type-aliases/ExtendContext.md) to specify the shape of plugin dependency extensions. |
| `Id` _extends_ [`string`](/api-ox/combinators/functions/string.md) = [`string`](/api-ox/combinators/functions/string.md)                                                            | A string type to specify the plugin ID.                                                                                                 |
| `Deps` _extends_ `ReadonlyArray`\<[`PluginDependency`](/api-ox/default/interfaces/PluginDependency.md) \| [`string`](/api-ox/combinators/functions/string.md)\> = `[]`              | A readonly array of [`PluginDependency`](/api-ox/default/interfaces/PluginDependency.md) or string to specify the plugin dependencies.  |
| `Extension` _extends_ `{}` = `{}`                                                                                                                                                   | A type to specify the shape of the plugin extension object.                                                                             |
| `ResolvedDepExtensions` _extends_ [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) = `DependencyParams<Deps, Context>`                                                  |                                                                                                                                         |

| `PluginExt` _extends_ [`PluginExtension`](/api-ox/default/type-aliases/PluginExtension.md)\<`Extension`, [`DefaultGunshiParams`](/api-ox/default/type-aliases/DefaultGunshiParams.md)\> = [`PluginExtension`](/api-ox/default/type-aliases/PluginExtension.md)\<
`Extension`,
`ResolvedDepExtensions`
\> | |
| `MergedExtensions` _extends_ [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) = `MergedPluginParams< Id, Deps, Context, Awaited<ReturnType<PluginExt>> >` | |

### Parameters

| Name      | Type      | Description                                                     |
| --------- | --------- | --------------------------------------------------------------- |
| `options` | `{ ... }` | [`plugin options`](/api-ox/default/interfaces/PluginOptions.md) |

### Returns

[`PluginWithExtension`](/api-ox/default/interfaces/PluginWithExtension.md)\<`Awaited`\<`ReturnType`\<`PluginExt`\>\>\> — A defined plugin with extension

## Call Signature

```ts
export function plugin<
  Context extends ExtendContext = DefaultGunshiParams['extensions'], // for plugin dependency extensions
  Id extends string = string, // for plugin id
  Deps extends ReadonlyArray<PluginDependency | string> = [], // for plugin dependencies
  Extension extends Record<string, unknown> = {}, // for plugin extension type
  ResolvedDepExtensions extends GunshiParams = DependencyParams<Deps, Context>,
  PluginExt extends PluginExtension<Extension, DefaultGunshiParams> = PluginExtension<
    Extension,
    ResolvedDepExtensions
  >,
  MergedExtensions extends GunshiParams = MergedPluginParams<
    Id,
    Deps,
    Context,
    Awaited<ReturnType<PluginExt>>
  >
>(options: {
  id: Id
  name?: string
  dependencies?: Deps
  setup?: (
    ctx: Readonly<
      PluginContext<MergedPluginParams<Id, Deps, Context, Awaited<ReturnType<PluginExt>>>>
    >
  ) => Awaitable<void>
  onExtension?: OnPluginExtension<MergedExtensions>
}): PluginWithoutExtension<DefaultGunshiParams['extensions']>
```

Define a plugin without extension and typed dependency extensions

### Since

v0.27.0

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L370-L396)

### Type Parameters

| Name                                                                                                                                                                                | Description                                                                                                                             |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `Context` _extends_ [`ExtendContext`](/api-ox/default/type-aliases/ExtendContext.md) = [`DefaultGunshiParams`](/api-ox/default/type-aliases/DefaultGunshiParams.md)\['extensions'\] | A type extending [`ExtendContext`](/api-ox/default/type-aliases/ExtendContext.md) to specify the shape of plugin dependency extensions. |
| `Id` _extends_ [`string`](/api-ox/combinators/functions/string.md) = [`string`](/api-ox/combinators/functions/string.md)                                                            | A string type to specify the plugin ID.                                                                                                 |
| `Deps` _extends_ `ReadonlyArray`\<[`PluginDependency`](/api-ox/default/interfaces/PluginDependency.md) \| [`string`](/api-ox/combinators/functions/string.md)\> = `[]`              | A readonly array of [`PluginDependency`](/api-ox/default/interfaces/PluginDependency.md) or string to specify the plugin dependencies.  |
| `Extension` _extends_ `Record`\<[`string`](/api-ox/combinators/functions/string.md), `unknown`\> = `{}`                                                                             | A type to specify the shape of the plugin extension object.                                                                             |
| `ResolvedDepExtensions` _extends_ [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) = `DependencyParams<Deps, Context>`                                                  |                                                                                                                                         |

| `PluginExt` _extends_ [`PluginExtension`](/api-ox/default/type-aliases/PluginExtension.md)\<`Extension`, [`DefaultGunshiParams`](/api-ox/default/type-aliases/DefaultGunshiParams.md)\> = [`PluginExtension`](/api-ox/default/type-aliases/PluginExtension.md)\<
`Extension`,
`ResolvedDepExtensions`
\> | |
| `MergedExtensions` _extends_ [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) = `MergedPluginParams< Id, Deps, Context, Awaited<ReturnType<PluginExt>> >` | |

### Parameters

| Name      | Type      | Description                                                                       |
| --------- | --------- | --------------------------------------------------------------------------------- |
| `options` | `{ ... }` | [`plugin options`](/api-ox/default/interfaces/PluginOptions.md) without extension |

### Returns

[`PluginWithoutExtension`](/api-ox/default/interfaces/PluginWithoutExtension.md)\<[`DefaultGunshiParams`](/api-ox/default/type-aliases/DefaultGunshiParams.md)\['extensions'\]\> — A defined plugin without extension
