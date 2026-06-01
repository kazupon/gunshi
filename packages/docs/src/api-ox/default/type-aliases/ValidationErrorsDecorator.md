# ValidationErrorsDecorator

Validation errors renderer decorator type.
A function that wraps a validation errors renderer to add or modify its behavior.

## Signature

```ts
export type ValidationErrorsDecorator<G extends GunshiParamsConstraint = DefaultGunshiParams> = (
  baseRenderer: (ctx: Readonly<CommandContext<G>>, error: AggregateError) => Promise<string>,
  ctx: Readonly<CommandContext<G>>,
  error: AggregateError
) => Promise<string>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L796-L800)

## Type Parameters

| Name                                                           | Description                                                                                                            |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `G` _extends_ `GunshiParamsConstraint` = `DefaultGunshiParams` | A type extending [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) to specify the shape of command context. |

## Parameters

| Name           | Type      | Description                                              |
| -------------- | --------- | -------------------------------------------------------- |
| `baseRenderer` | `unknown` | The base validation errors renderer function to decorate |
| `ctx`          | `unknown` | The command context                                      |
| `error`        | `unknown` | The aggregate error containing validation errors         |

## Returns

`unknown` — The decorated result

## Tags

- `@since` — v0.27.0
