# Interface: StringOptions

> [!WARNING]
> This API is experimental and may change in future versions.

Options for the [string](/api-ox/combinators/functions/string.md) combinator.

## Signature

```ts
interface StringOptions extends BaseOptions
```

## Properties

| Name                     | Type                                                | Description                                      |
| ------------------------ | --------------------------------------------------- | ------------------------------------------------ |
| `maxLength` _(optional)_ | [`number`](/api-ox/combinators/functions/number.md) | Maximum string length.                           |
| `minLength` _(optional)_ | [`number`](/api-ox/combinators/functions/number.md) | Minimum string length.                           |
| `pattern` _(optional)_   | `RegExp`                                            | Regular expression pattern the value must match. |
