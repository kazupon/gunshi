# Function: number()

> [!WARNING]
> This API is experimental and may change in future versions.

Create a number argument schema with optional range validation.

Accepts any numeric value (integer or float).

## Signature

```ts
declare function number(opts?: NumberOptions): CombinatorSchema<number>
```

## Parameters

| Name   | Type                                                               | Description                 |
| ------ | ------------------------------------------------------------------ | --------------------------- |
| `opts` | [`NumberOptions`](/api-ox/combinators/interfaces/NumberOptions.md) | Range options. _(optional)_ |

## Returns

[`CombinatorSchema`](/api-ox/combinators/type-aliases/CombinatorSchema.md)\<[`number`](/api-ox/combinators/functions/number.md)\> — A combinator schema that resolves to number.

## Examples

```ts
const args = {
  timeout: number({ min: 0, max: 30000 })
}
```
