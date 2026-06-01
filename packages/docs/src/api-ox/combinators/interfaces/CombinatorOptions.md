# CombinatorOptions

Options for the [combinator](/api-ox/combinators/functions/combinator.md) factory function.

## Signature

```ts
interface CombinatorOptions<T> extends BaseOptions
```

## Type Parameters

| Name | Description            |
| ---- | ---------------------- |
| `T`  | The parsed value type. |

## Properties

| Name                   | Kind     | Type                   | Description                                                                                         |
| ---------------------- | -------- | ---------------------- | --------------------------------------------------------------------------------------------------- |
| `parse`                | property | `(value: string) => T` | The parse function that converts a string to the desired type. Returns: The parsed value of type T. |
| `metavar` _(optional)_ | property | `string`               | Display name hint for help text generation.                                                         |

## Tags

- `@experimental`
