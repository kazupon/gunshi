# Function: describe()

> [!WARNING]
> This API is experimental and may change in future versions.

Set a description on a combinator schema for help text generation.

The original schema is not modified.

## Signature

```ts
declare function describe<T, D extends string>(schema: CombinatorSchema<T>, text: D): CombinatorSchema<T> & CombinatorDescribe<D>
```

## Type Parameters

| Name | Description |
| --- | --- |
| `T` | The schema's parsed type. |
| `D` *extends* `string` | The description string literal type. |

## Parameters

| Name | Type | Description |
| --- | --- | --- |
| `schema` | [`CombinatorSchema`](/api/combinators/type-aliases/CombinatorSchema.md)\<`T`\> | The base combinator schema. |
| `text` | `D` | Human-readable description. |

## Returns

[`CombinatorSchema`](/api/combinators/type-aliases/CombinatorSchema.md)\<`T`\> & `CombinatorDescribe`\<`D`\> — A new schema with the description set.

## Examples

```ts
const args = {
  port: describe(integer(), 'Port number to listen on')
}
```
