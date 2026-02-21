[gunshi](../../index.md) / [combinators](../index.md) / map

# Function: map()

```ts
function map<T, U>(schema, transform): CombinatorSchema<U>
```

**`Experimental`**

Transform the output of a combinator schema.

Creates a new schema that applies `transform` to the result of `schema.parse`.
The original schema is not modified.

## Type Parameters

| Type Parameter | Description                     |
| -------------- | ------------------------------- |
| `T`            | The input schema's parsed type. |
| `U`            | The transformed type.           |

## Parameters

| Parameter   | Type                                                             | Description                  |
| ----------- | ---------------------------------------------------------------- | ---------------------------- |
| `schema`    | [`CombinatorSchema`](../type-aliases/CombinatorSchema.md)\<`T`\> | The base combinator schema.  |
| `transform` | (`value`) => `U`                                                 | The transformation function. |

## Returns

[`CombinatorSchema`](../type-aliases/CombinatorSchema.md)\<`U`\>

A new combinator schema that resolves to the transformed type.

## Example

```ts
const args = {
  doubled: map(integer(), n => n * 2)
}
```
