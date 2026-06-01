# lazy

Define a [lazy command](/api-ox/definition/type-aliases/LazyCommand.md) with or without definition.

## Signature

```ts
export function lazy<G extends GunshiParamsConstraint = DefaultGunshiParams>(
  loader: CommandLoader<G>,
  definition?: Partial<Command<G>>
): LazyCommand<G, any>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/definition.ts#L274-L299)

## Type Parameters

| Name                                                           | Description |
| -------------------------------------------------------------- | ----------- |
| `G` _extends_ `GunshiParamsConstraint` = `DefaultGunshiParams` |             |

## Parameters

| Name         | Type                  | Description                                                                                                     |
| ------------ | --------------------- | --------------------------------------------------------------------------------------------------------------- |
| `loader`     | `CommandLoader<G>`    | A [command loader](/api-ox/definition/type-aliases/CommandLoader.md) function that returns a command definition |
| `definition` | `Partial<Command<G>>` | An optional [command](/api-ox/definition/interfaces/Command.md) definition _(optional)_                         |

## Returns

`LazyCommand<G, any>` — A [lazy command](/api-ox/definition/type-aliases/LazyCommand.md) that can be executed later
