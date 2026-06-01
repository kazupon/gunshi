# CommandExamplesFetcher

Command examples fetcher.

## Signature

```ts
export type CommandExamplesFetcher<G extends GunshiParamsConstraint = DefaultGunshiParams> = (
  ctx: Readonly<CommandContext<G>>
) => Awaitable<string>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L718-L720)

## Type Parameters

| Name                                                           | Description                                                                                                           |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `G` _extends_ `GunshiParamsConstraint` = `DefaultGunshiParams` | A type extending [`GunshiParams`](/api-ox/plugin/interfaces/GunshiParams.md) to specify the shape of command context. |

## Parameters

| Name  | Type      | Description                                                      |
| ----- | --------- | ---------------------------------------------------------------- |
| `ctx` | `unknown` | A [command context](/api-ox/plugin/interfaces/CommandContext.md) |

## Returns

`unknown` — A fetched command examples.
