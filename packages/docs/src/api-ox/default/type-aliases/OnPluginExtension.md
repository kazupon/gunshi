# Type Alias: OnPluginExtension\<G\>

Plugin extension callback, which is called when the plugin is extended with `extension` option.

## Since

v0.27.0

## Signature

```ts
export type OnPluginExtension<G extends GunshiParams = DefaultGunshiParams> = (
  ctx: Readonly<CommandContext<G>>,
  cmd: Readonly<Command<G>>
) => Awaitable<void>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L131-L134)

## Type Parameters

| Name                                                                                                                                                      | Description                                                                                                                                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `G` _extends_ [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) = [`DefaultGunshiParams`](/api-ox/default/type-aliases/DefaultGunshiParams.md) | A type extending [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) to specify the shape of [`CommandContext`](/api-ox/default/interfaces/CommandContext.md) and [`Command`](/api-ox/default/interfaces/Command.md). |

## Parameters

| Name  | Type      | Description                                                           |
| ----- | --------- | --------------------------------------------------------------------- |
| `ctx` | `unknown` | The [`command context`](/api-ox/default/interfaces/CommandContext.md) |
| `cmd` | `unknown` | The [`command`](/api-ox/default/interfaces/Command.md)                |
