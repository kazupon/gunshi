# Function: required()

> [!WARNING]
> This API is experimental and may change in future versions.

Mark a combinator schema as required.

The original schema is not modified.

## Signature

```ts
declare function required<T>(schema: CombinatorSchema<T>): CombinatorSchema<T> & CombinatorRequired
```

## Type Parameters

| Name | Description |
| --- | --- |
| `T` | The schema's parsed type. |

## Parameters

| Name | Type | Description |
| --- | --- | --- |
| `schema` | [`CombinatorSchema`](/api/combinators/type-aliases/CombinatorSchema.md)\<`T`\> | The base combinator schema. |

## Returns

[`CombinatorSchema`](/api/combinators/type-aliases/CombinatorSchema.md)\<`T`\> & `CombinatorRequired` — A new schema with `required: true`.

## Examples

```ts
const args = {
  name: required(string())
}
```
