# CommandRunner

Command runner.

## Signature

```ts
export type CommandRunner<G extends GunshiParamsConstraint = DefaultGunshiParams> = (
  ctx: Readonly<CommandContext<G>>
) => Awaitable<string | void>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L730-L732)

## Type Parameters

| Name                                                           | Description                                                                                                               |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `G` _extends_ `GunshiParamsConstraint` = `DefaultGunshiParams` | A type extending [`GunshiParams`](/api-ox/definition/interfaces/GunshiParams.md) to specify the shape of command context. |

## Parameters

| Name  | Type      | Description                                                       |
| ----- | --------- | ----------------------------------------------------------------- |
| `ctx` | `unknown` | A [command context](/api-ox/default/interfaces/CommandContext.md) |

## Returns

`unknown` — void or string (for CLI output)
