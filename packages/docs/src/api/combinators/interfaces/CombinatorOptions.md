# Interface: CombinatorOptions&lt;T&gt;

> [!WARNING]
> This API is experimental and may change in future versions.

Options for the [combinator](/api/combinators/functions/combinator.md) factory function.

## Extends

- [`BaseOptions`](/api/combinators/interfaces/BaseOptions.md)

## Signature

```ts
interface CombinatorOptions<T> extends BaseOptions
```

## Type Parameters

| Name | Description |
| --- | --- |
| `T` | The parsed value type. |

## Properties

| Name | Type | Description |
| --- | --- | --- |
| `metavar` _(optional)_ | `string` | Display name hint for help text generation. **Default:** `'custom'` |
| `parse` | `(value: string) => T` | The parse function that converts a string to the desired type. |

### parse Parameters

| Name | Type | Description |
| --- | --- | --- |
| `value` | `string` | The input string value. |

### parse Returns

`T` — The parsed value of type T.
