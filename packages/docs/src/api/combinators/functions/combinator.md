[gunshi](../../index.md) / [combinators](../index.md) / combinator

# Function: combinator()

```ts
function combinator<T>(config): CombinatorSchema<T>
```

**`Experimental`**

Create a custom argument schema with a user-defined parse function.

This is the most general custom combinator. Use it when none of the built-in
base combinators ([string](string.md), [number](number.md), [integer](integer.md),
[float](float.md), [boolean](boolean.md), [choice](choice.md)) fit your needs.

The returned schema has `type: 'custom'`.

## Type Parameters

| Type Parameter | Description            |
| -------------- | ---------------------- |
| `T`            | The parsed value type. |

## Parameters

| Parameter | Type                                                             | Description                                               |
| --------- | ---------------------------------------------------------------- | --------------------------------------------------------- |
| `config`  | [`CombinatorOptions`](../interfaces/CombinatorOptions.md)\<`T`\> | Configuration with a parse function and optional metavar. |

## Returns

[`CombinatorSchema`](../type-aliases/CombinatorSchema.md)\<`T`\>

A combinator schema that resolves to the parse function's return type.

## Example

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
