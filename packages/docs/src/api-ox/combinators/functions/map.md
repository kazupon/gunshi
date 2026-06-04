# Function: map()

> [!WARNING]
> This API is experimental and may change in future versions.

Transform the output of a combinator schema.

Creates a new schema that applies `transform` to the result of `schema.parse`.
The original schema is not modified.

## Signature

```ts
declare function map<T, U>(
  schema: CombinatorSchema<T>,
  transform: (value: T) => U
): CombinatorSchema<U>
```

## Type Parameters

| Name | Description                     |
| ---- | ------------------------------- |
| `T`  | The input schema's parsed type. |
| `U`  | The transformed type.           |

## Parameters

| Name        | Type                                                                              | Description                  |
| ----------- | --------------------------------------------------------------------------------- | ---------------------------- |
| `schema`    | [`CombinatorSchema`](/api-ox/combinators/type-aliases/CombinatorSchema.md)\<`T`\> | The base combinator schema.  |
| `transform` | `(value: T) => U`                                                                 | The transformation function. |

## Returns

[`CombinatorSchema`](/api-ox/combinators/type-aliases/CombinatorSchema.md)\<`U`\> — A new combinator schema that resolves to the transformed type.

## Examples

```ts
const args = {
  doubled: map(integer(), n => n * 2)
}
```
