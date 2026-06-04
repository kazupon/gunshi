# Function: float()

> [!WARNING]
> This API is experimental and may change in future versions.

Create a floating-point argument schema with optional range validation.

Rejects `NaN` and `Infinity` values.

## Signature

```ts
declare function float(opts?: FloatOptions): CombinatorSchema<number>
```

## Parameters

| Name   | Type                                                             | Description                 |
| ------ | ---------------------------------------------------------------- | --------------------------- |
| `opts` | [`FloatOptions`](/api-ox/combinators/interfaces/FloatOptions.md) | Range options. _(optional)_ |

## Returns

[`CombinatorSchema`](/api-ox/combinators/type-aliases/CombinatorSchema.md)\<[`number`](/api-ox/combinators/functions/number.md)\> — A combinator schema that resolves to number (float).

## Examples

```ts
const args = {
  ratio: float({ min: 0, max: 1 })
}
```
