# Combinator

A combinator produced by combinator factory functions.

## Signature

```ts
type Combinator<T> = {
  /**
   * The parse function that converts a string to the desired type.
   *
   * @param value - The input string value.
   * @returns The parsed value of type T.
   */
  parse: (value: string) => T
}
```

## Type Parameters

| Name | Description            |
| ---- | ---------------------- |
| `T`  | The parsed value type. |

## Properties

| Name    | Kind     | Type                   | Description                                                                                         |
| ------- | -------- | ---------------------- | --------------------------------------------------------------------------------------------------- |
| `parse` | property | `(value: string) => T` | The parse function that converts a string to the desired type. Returns: The parsed value of type T. |

## Tags

- `@experimental`
