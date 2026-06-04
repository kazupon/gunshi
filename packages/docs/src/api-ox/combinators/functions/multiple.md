# Function: multiple()

> [!WARNING]
> This API is experimental and may change in future versions.

Mark a combinator schema as accepting multiple values.

The resolved value becomes an array. The original schema is not modified.

## Signature

```ts
declare function multiple<T>(schema: CombinatorSchema<T>): CombinatorSchema<T> & CombinatorMultiple
```

## Type Parameters

| Name | Description               |
| ---- | ------------------------- |
| `T`  | The schema's parsed type. |

## Parameters

| Name     | Type                                                                              | Description                 |
| -------- | --------------------------------------------------------------------------------- | --------------------------- |
| `schema` | [`CombinatorSchema`](/api-ox/combinators/type-aliases/CombinatorSchema.md)\<`T`\> | The base combinator schema. |

## Returns

[`CombinatorSchema`](/api-ox/combinators/type-aliases/CombinatorSchema.md)\<`T`\> & `CombinatorMultiple` — A new schema with `multiple: true`.

## Examples

```ts
const args = {
  tags: multiple(string())
}
// typeof values.tags === string[]
```
