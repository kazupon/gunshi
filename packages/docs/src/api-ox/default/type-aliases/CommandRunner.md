# Type Alias: CommandRunner\<G\>

Command runner.

## Signature

```ts
export type CommandRunner<G extends GunshiParamsConstraint = DefaultGunshiParams> = (
  ctx: Readonly<CommandContext<G>>
) => Awaitable<string | void>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L730-L732)

## Type Parameters

| Name                                                                                                                                                                            | Description                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `G` _extends_ [`GunshiParamsConstraint`](/api-ox/default/type-aliases/GunshiParamsConstraint.md) = [`DefaultGunshiParams`](/api-ox/default/type-aliases/DefaultGunshiParams.md) | A type extending [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) to specify the shape of command context. |

## Parameters

| Name  | Type      | Description                                                       |
| ----- | --------- | ----------------------------------------------------------------- |
| `ctx` | `unknown` | A [command context](/api-ox/default/interfaces/CommandContext.md) |

## Returns

`unknown` — void or string (for CLI output)
