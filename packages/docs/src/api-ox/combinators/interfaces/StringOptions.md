# StringOptions

Options for the [string](/api-ox/combinators/functions/string.md) combinator.

## Signature

```ts
interface StringOptions extends BaseOptions
```

## Properties

| Name                     | Kind     | Type     | Description                                      |
| ------------------------ | -------- | -------- | ------------------------------------------------ |
| `minLength` _(optional)_ | property | `number` | Minimum string length.                           |
| `maxLength` _(optional)_ | property | `number` | Maximum string length.                           |
| `pattern` _(optional)_   | property | `RegExp` | Regular expression pattern the value must match. |

## Tags

- `@experimental`
