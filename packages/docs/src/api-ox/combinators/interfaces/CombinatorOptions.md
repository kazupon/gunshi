# Interface: CombinatorOptions\<T\>

> [!WARNING]
> This API is experimental and may change in future versions.

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

| Name                   | Type                                                                   | Description                                                                                         |
| ---------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `metavar` _(optional)_ | [`string`](/api-ox/combinators/functions/string.md)                    | Display name hint for help text generation.                                                         |
| `parse`                | (`value`: [`string`](/api-ox/combinators/functions/string.md)) =\> `T` | The parse function that converts a string to the desired type. Returns: The parsed value of type T. |

### parse Parameters

| Name    | Type      | Description             |
| ------- | --------- | ----------------------- |
| `value` | `unknown` | The input string value. |
