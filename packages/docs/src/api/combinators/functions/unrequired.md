# Function: unrequired()

> [!WARNING]
> This API is experimental and may change in future versions.

Mark a combinator schema as not required.

Useful for overriding a base combinator that was created with `required: true`.
The original schema is not modified.

## Signature

```ts
declare function unrequired<T>(schema: CombinatorSchema<T>): CombinatorSchema<T> & CombinatorUnrequired
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

[`CombinatorSchema`](/api/combinators/type-aliases/CombinatorSchema.md)\<`T`\> & `CombinatorUnrequired` — A new schema with `required: false`.

## Examples

```ts
const args = {
  name: unrequired(string({ required: true }))
}
```
