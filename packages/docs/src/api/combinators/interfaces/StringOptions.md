# Interface: StringOptions

> [!WARNING]
> This API is experimental and may change in future versions.

Options for the [string](/api/combinators/functions/string.md) combinator.

## Extends

- [`BaseOptions`](/api/combinators/interfaces/BaseOptions.md)

## Signature

```ts
interface StringOptions extends BaseOptions
```

## Properties

| Name | Type | Description |
| --- | --- | --- |
| `maxLength` _(optional)_ | `number` | Maximum string length. |
| `minLength` _(optional)_ | `number` | Minimum string length. |
| `pattern` _(optional)_ | `RegExp` | Regular expression pattern the value must match. |
