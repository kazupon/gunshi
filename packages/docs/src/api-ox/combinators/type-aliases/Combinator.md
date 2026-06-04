# Type Alias: Combinator\<T\>

> [!WARNING]
> This API is experimental and may change in future versions.

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

| Name    | Type                                                                   | Description                                                                                         |
| ------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `parse` | (`value`: [`string`](/api-ox/combinators/functions/string.md)) =\> `T` | The parse function that converts a string to the desired type. Returns: The parsed value of type T. |

### parse Parameters

| Name    | Type      | Description             |
| ------- | --------- | ----------------------- |
| `value` | `unknown` | The input string value. |
