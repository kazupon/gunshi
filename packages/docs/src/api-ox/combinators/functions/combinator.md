# Function: combinator()

> [!WARNING]
> This API is experimental and may change in future versions.

Create a custom argument schema with a user-defined parse function.

This is the most general custom combinator. Use it when none of the built-in
base combinators ([string](/api-ox/combinators/functions/string.md), [number](/api-ox/combinators/functions/number.md), [integer](/api-ox/combinators/functions/integer.md),
[float](/api-ox/combinators/functions/float.md), [boolean](/api-ox/combinators/functions/boolean.md), [choice](/api-ox/combinators/functions/choice.md)) fit your needs.

The returned schema has `type: 'custom'`.

## Signature

```ts
declare function combinator<T>(config: CombinatorOptions<T>): CombinatorSchema<T>
```

## Type Parameters

| Name | Description            |
| ---- | ---------------------- |
| `T`  | The parsed value type. |

## Parameters

| Name     | Type                                                                              | Description                                               |
| -------- | --------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `config` | [`CombinatorOptions`](/api-ox/combinators/interfaces/CombinatorOptions.md)\<`T`\> | Configuration with a parse function and optional metavar. |

## Returns

[`CombinatorSchema`](/api-ox/combinators/type-aliases/CombinatorSchema.md)\<`T`\> — A combinator schema that resolves to the parse function's return type.

## Examples

```ts
const date = combinator({
  parse: value => {
    const d = new Date(value)
    if (isNaN(d.getTime())) {
      throw new Error('Invalid date format')
    }
    return d
  },
  metavar: 'date'
})
```
