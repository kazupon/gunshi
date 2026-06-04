# Type Alias: CommandDecorator\<G\>

Command decorator.

A function that wraps a command runner to add or modify its behavior.

## Since

v0.27.0

## Signature

```ts
export type CommandDecorator<G extends GunshiParamsConstraint = DefaultGunshiParams> = (
  baseRunner: (ctx: Readonly<CommandContext<G>>) => Awaitable<string | void>
) => (ctx: Readonly<CommandContext<G>>) => Awaitable<string | void>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L760-L762)

## Type Parameters

| Name                                                                                                                                                                            | Description                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `G` _extends_ [`GunshiParamsConstraint`](/api-ox/default/type-aliases/GunshiParamsConstraint.md) = [`DefaultGunshiParams`](/api-ox/default/type-aliases/DefaultGunshiParams.md) | A type extending [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) to specify the shape of command context. |

## Parameters

| Name         | Type      | Description                         |
| ------------ | --------- | ----------------------------------- |
| `baseRunner` | `unknown` | The base command runner to decorate |

## Returns

`unknown` — The decorated command runner
