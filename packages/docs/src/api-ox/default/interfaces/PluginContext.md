# Interface: PluginContext\<G\>

Gunshi plugin context interface.

## Since

v0.27.0

## Signature

```ts
export interface PluginContext<G extends GunshiParamsConstraint = DefaultGunshiParams>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/context.ts#L28-L131)

## Type Parameters

| Name                                                                                                                                                                            | Description                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `G` _extends_ [`GunshiParamsConstraint`](/api-ox/default/type-aliases/GunshiParamsConstraint.md) = [`DefaultGunshiParams`](/api-ox/default/type-aliases/DefaultGunshiParams.md) | A type extending [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) to specify the shape of command parameters. |

## Properties

| Name                         | Type                                                                                                                                                                                                   | Description                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| `globalOptions` _(readonly)_ | `Map`\<[`string`](/api-ox/combinators/functions/string.md), [`ArgSchema`](/api-ox/default/interfaces/ArgSchema.md)\>                                                                                   | Get the global options Returns: A map of global options.        |
| `subCommands` _(readonly)_   | `ReadonlyMap`\<[`string`](/api-ox/combinators/functions/string.md), [`Command`](/api-ox/default/interfaces/Command.md)\<`G`\> \| [`LazyCommand`](/api-ox/default/type-aliases/LazyCommand.md)\<`G`\>\> | Get the registered sub commands Returns: A map of sub commands. |

## Methods

| Name              | Type                                                                                                                                                                                                                           | Description          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| `addCommand`      | `addCommand`(`name`: [`string`](/api-ox/combinators/functions/string.md), `command`: [`Command`](/api-ox/default/interfaces/Command.md)\<`G`\> \| [`LazyCommand`](/api-ox/default/type-aliases/LazyCommand.md)\<`G`\>): `void` | Add a sub command.   |
| `addGlobalOption` | `addGlobalOption`(`name`: [`string`](/api-ox/combinators/functions/string.md), `schema`: [`ArgSchema`](/api-ox/default/interfaces/ArgSchema.md)): `void`                                                                       | Add a global option. |
| `decorateCommand` | `decorateCommand`\<`L` `extends` `Record`\<[`string`](/api-ox/combinators/functions/string.md), `unknown`\> = [`DefaultGunshiParams`](/api-ox/default/type-aliases/DefaultGunshiParams.md)\['extensions'\]\>(`decorator`: (    |

      `baseRunner`: (
        `ctx`: `Readonly`\<[`CommandContext`](/api-ox/default/interfaces/CommandContext.md)\<`MergeGunshiExtensions`\<`G`, `L`\>\>\>
      ) =\> [`Awaitable`](/api-ox/default/type-aliases/Awaitable.md)\<`void` \| [`string`](/api-ox/combinators/functions/string.md)\>
    ) =\> (`ctx`: `Readonly`\<[`CommandContext`](/api-ox/default/interfaces/CommandContext.md)\<`MergeGunshiExtensions`\<`G`, `L`\>\>\>) =\> [`Awaitable`](/api-ox/default/type-aliases/Awaitable.md)\<`void` \| [`string`](/api-ox/combinators/functions/string.md)\>): `void` | Decorate the command execution. Decorators are applied in reverse order (last registered is executed first). |

| `decorateHeaderRenderer` | `decorateHeaderRenderer`\<`L` `extends` `Record`\<[`string`](/api-ox/combinators/functions/string.md), `unknown`\> = [`DefaultGunshiParams`](/api-ox/default/type-aliases/DefaultGunshiParams.md)\['extensions'\]\>(`decorator`: (
`baseRenderer`: (`ctx`: `Readonly`\<[`CommandContext`](/api-ox/default/interfaces/CommandContext.md)\<`MergeGunshiExtensions`\<`G`, `L`\>\>\>) =\> `Promise`\<[`string`](/api-ox/combinators/functions/string.md)\>,
`ctx`: `Readonly`\<[`CommandContext`](/api-ox/default/interfaces/CommandContext.md)\<`MergeGunshiExtensions`\<`G`, `L`\>\>\>
) =\> `Promise`\<[`string`](/api-ox/combinators/functions/string.md)\>): `void` | Decorate the header renderer. |
| `decorateUsageRenderer` | `decorateUsageRenderer`\<`L` `extends` `Record`\<[`string`](/api-ox/combinators/functions/string.md), `unknown`\> = [`DefaultGunshiParams`](/api-ox/default/type-aliases/DefaultGunshiParams.md)\['extensions'\]\>(`decorator`: (
`baseRenderer`: (`ctx`: `Readonly`\<[`CommandContext`](/api-ox/default/interfaces/CommandContext.md)\<`MergeGunshiExtensions`\<`G`, `L`\>\>\>) =\> `Promise`\<[`string`](/api-ox/combinators/functions/string.md)\>,
`ctx`: `Readonly`\<[`CommandContext`](/api-ox/default/interfaces/CommandContext.md)\<`MergeGunshiExtensions`\<`G`, `L`\>\>\>
) =\> `Promise`\<[`string`](/api-ox/combinators/functions/string.md)\>): `void` | Decorate the usage renderer. |
| `decorateValidationErrorsRenderer` | `decorateValidationErrorsRenderer`\<
`L` `extends` `Record`\<[`string`](/api-ox/combinators/functions/string.md), `unknown`\> = [`DefaultGunshiParams`](/api-ox/default/type-aliases/DefaultGunshiParams.md)\['extensions'\]
\>(`decorator`: (
`baseRenderer`: (
`ctx`: `Readonly`\<[`CommandContext`](/api-ox/default/interfaces/CommandContext.md)\<`MergeGunshiExtensions`\<`G`, `L`\>\>\>,
`error`: `AggregateError`
) =\> `Promise`\<[`string`](/api-ox/combinators/functions/string.md)\>,
`ctx`: `Readonly`\<[`CommandContext`](/api-ox/default/interfaces/CommandContext.md)\<`MergeGunshiExtensions`\<`G`, `L`\>\>\>,
`error`: `AggregateError`
) =\> `Promise`\<[`string`](/api-ox/combinators/functions/string.md)\>): `void` | Decorate the validation errors renderer. |
| `hasCommand` | `hasCommand`(`name`: [`string`](/api-ox/combinators/functions/string.md)): [`boolean`](/api-ox/combinators/functions/boolean.md) | Check if a command exists. Returns: True if the command exists, false otherwise |

### addCommand Parameters

| Name      | Type                                                                                                                             | Description        |
| --------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| `name`    | [`string`](/api-ox/combinators/functions/string.md)                                                                              | Command name       |
| `command` | [`Command`](/api-ox/default/interfaces/Command.md)\<`G`\> \| [`LazyCommand`](/api-ox/default/type-aliases/LazyCommand.md)\<`G`\> | Command definition |

### addGlobalOption Parameters

| Name     | Type                                                   | Description                                                              |
| -------- | ------------------------------------------------------ | ------------------------------------------------------------------------ |
| `name`   | [`string`](/api-ox/combinators/functions/string.md)    | An option name                                                           |
| `schema` | [`ArgSchema`](/api-ox/default/interfaces/ArgSchema.md) | An [`ArgSchema`](/api-ox/default/interfaces/ArgSchema.md) for the option |

### decorateCommand Parameters

| Name        | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Description                                        |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `decorator` | (`baseRunner`: (`ctx`: `Readonly`\<[`CommandContext`](/api-ox/default/interfaces/CommandContext.md)\<`MergeGunshiExtensions`\<`G`, `L`\>\>\>) =\> [`Awaitable`](/api-ox/default/type-aliases/Awaitable.md)\<`void` \| [`string`](/api-ox/combinators/functions/string.md)\>) =\> (`ctx`: `Readonly`\<[`CommandContext`](/api-ox/default/interfaces/CommandContext.md)\<`MergeGunshiExtensions`\<`G`, `L`\>\>\>) =\> [`Awaitable`](/api-ox/default/type-aliases/Awaitable.md)\<`void` \| [`string`](/api-ox/combinators/functions/string.md)\> | A decorator function that wraps the command runner |

### decorateHeaderRenderer Parameters

| Name        | Type                                                                                                                                                                                                                                                                                                                                                                                                                     | Description                                               |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------- |
| `decorator` | (`baseRenderer`: (`ctx`: `Readonly`\<[`CommandContext`](/api-ox/default/interfaces/CommandContext.md)\<`MergeGunshiExtensions`\<`G`, `L`\>\>\>) =\> `Promise`\<[`string`](/api-ox/combinators/functions/string.md)\>, `ctx`: `Readonly`\<[`CommandContext`](/api-ox/default/interfaces/CommandContext.md)\<`MergeGunshiExtensions`\<`G`, `L`\>\>\>) =\> `Promise`\<[`string`](/api-ox/combinators/functions/string.md)\> | A decorator function that wraps the base header renderer. |

### decorateUsageRenderer Parameters

| Name        | Type                                                                                                                                                                                                                                                                                                                                                                                                                     | Description                                              |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| `decorator` | (`baseRenderer`: (`ctx`: `Readonly`\<[`CommandContext`](/api-ox/default/interfaces/CommandContext.md)\<`MergeGunshiExtensions`\<`G`, `L`\>\>\>) =\> `Promise`\<[`string`](/api-ox/combinators/functions/string.md)\>, `ctx`: `Readonly`\<[`CommandContext`](/api-ox/default/interfaces/CommandContext.md)\<`MergeGunshiExtensions`\<`G`, `L`\>\>\>) =\> `Promise`\<[`string`](/api-ox/combinators/functions/string.md)\> | A decorator function that wraps the base usage renderer. |

### decorateValidationErrorsRenderer Parameters

| Name        | Type                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Description                                                          |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `decorator` | (`baseRenderer`: (`ctx`: `Readonly`\<[`CommandContext`](/api-ox/default/interfaces/CommandContext.md)\<`MergeGunshiExtensions`\<`G`, `L`\>\>\>, `error`: `AggregateError`) =\> `Promise`\<[`string`](/api-ox/combinators/functions/string.md)\>, `ctx`: `Readonly`\<[`CommandContext`](/api-ox/default/interfaces/CommandContext.md)\<`MergeGunshiExtensions`\<`G`, `L`\>\>\>, `error`: `AggregateError`) =\> `Promise`\<[`string`](/api-ox/combinators/functions/string.md)\> | A decorator function that wraps the base validation errors renderer. |

### hasCommand Parameters

| Name   | Type                                                | Description  |
| ------ | --------------------------------------------------- | ------------ |
| `name` | [`string`](/api-ox/combinators/functions/string.md) | Command name |
