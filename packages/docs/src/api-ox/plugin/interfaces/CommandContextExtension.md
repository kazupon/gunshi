# CommandContextExtension

Command context extension

## Signature

```ts
export interface CommandContextExtension<
  E extends GunshiParams['extensions'] = DefaultGunshiParams['extensions']
>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L496-L511)

## Type Parameters

| Name                                                                             | Description                                                                                                                                        |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `E` _extends_ `GunshiParams['extensions']` = `DefaultGunshiParams['extensions']` | A type extending [`GunshiParams.extensions`](/api-ox/plugin/interfaces/GunshiParams.md#property-extensions) to specify the shape of the extension. |

## Properties

| Name                               | Kind     | Type                                                                         | Description                         |
| ---------------------------------- | -------- | ---------------------------------------------------------------------------- | ----------------------------------- |
| `key` _(readonly)_                 | property | `symbol`                                                                     | Plugin identifier                   |
| `factory` _(readonly)_             | property | `(ctx: CommandContextCore, cmd: Command) => Awaitable<E>`                    | Plugin extension factory            |
| `onFactory` _(optional, readonly)_ | property | `(ctx: Readonly<CommandContext>, cmd: Readonly<Command>) => Awaitable<void>` | Plugin extension factory after hook |

## Tags

- `@since` — v0.27.0
