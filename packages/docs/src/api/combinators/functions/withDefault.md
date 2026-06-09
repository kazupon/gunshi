# Function: withDefault()

> [!WARNING]
> This API is experimental and may change in future versions.

Set a default value on a combinator schema.

The original schema is not modified.

## Signature

```ts
declare function withDefault<T extends string | boolean | number>(schema: CombinatorSchema<T>, defaultValue: T): CombinatorSchema<T> & CombinatorWithDefault<T>
```

## Type Parameters

| Name | Description |
| --- | --- |
| `T` *extends* `string \| boolean \| number` | The schema's parsed type. |

## Parameters

| Name | Type | Description |
| --- | --- | --- |
| `schema` | [`CombinatorSchema`](/api/combinators/type-aliases/CombinatorSchema.md)\<`T`\> | The base combinator schema. |
| `defaultValue` | `T` | The default value. |

## Returns

[`CombinatorSchema`](/api/combinators/type-aliases/CombinatorSchema.md)\<`T`\> & `CombinatorWithDefault`\<`T`\> — A new schema with the default value set.

## Examples

```ts
const args = {
  port: withDefault(integer({ min: 1, max: 65535 }), 8080)
}
```
