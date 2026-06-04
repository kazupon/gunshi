# Function: short()

> [!WARNING]
> This API is experimental and may change in future versions.

Set a short alias on a combinator schema.

The original schema is not modified.

## Signature

```ts
declare function short<T, S extends string>(
  schema: CombinatorSchema<T>,
  alias: S
): CombinatorSchema<T> & CombinatorShort<S>
```

## Type Parameters

| Name                                                              | Description                          |
| ----------------------------------------------------------------- | ------------------------------------ |
| `T`                                                               | The schema's parsed type.            |
| `S` _extends_ [`string`](/api-ox/combinators/functions/string.md) | The short alias string literal type. |

## Parameters

| Name     | Type                                                                              | Description                   |
| -------- | --------------------------------------------------------------------------------- | ----------------------------- |
| `schema` | [`CombinatorSchema`](/api-ox/combinators/type-aliases/CombinatorSchema.md)\<`T`\> | The base combinator schema.   |
| `alias`  | `S`                                                                               | Single character short alias. |

## Returns

[`CombinatorSchema`](/api-ox/combinators/type-aliases/CombinatorSchema.md)\<`T`\> & `CombinatorShort`\<`S`\> — A new schema with the short alias set.

## Examples

```ts
const args = {
  verbose: short(boolean(), 'v')
}
// Usage: -v or --verbose
```
