# Function: string()

> [!WARNING]
> This API is experimental and may change in future versions.

Create a string argument schema with optional validation.

## Signature

```ts
declare function string(opts?: StringOptions): CombinatorSchema<string>
```

## Parameters

| Name | Type | Description |
| --- | --- | --- |
| `opts` | [`StringOptions`](/api/combinators/interfaces/StringOptions.md) | Validation options. _(optional)_ |

## Returns

[`CombinatorSchema`](/api/combinators/type-aliases/CombinatorSchema.md)\<`string`\> — A combinator schema that resolves to string.

## Examples

```ts
const args = {
  name: string({ minLength: 1, maxLength: 50 })
}
```
