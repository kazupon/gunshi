# Function: integer()

> [!WARNING]
> This API is experimental and may change in future versions.

Create an integer argument schema with optional range validation.

Only accepts integer values (no decimals).

## Signature

```ts
declare function integer(opts?: IntegerOptions): CombinatorSchema<number>
```

## Parameters

| Name   | Type                                                                 | Description                 |
| ------ | -------------------------------------------------------------------- | --------------------------- |
| `opts` | [`IntegerOptions`](/api-ox/combinators/interfaces/IntegerOptions.md) | Range options. _(optional)_ |

## Returns

[`CombinatorSchema`](/api-ox/combinators/type-aliases/CombinatorSchema.md)\<[`number`](/api-ox/combinators/functions/number.md)\> — A combinator schema that resolves to number (integer).

## Examples

```ts
const args = {
  retries: integer({ min: 0, max: 10 })
}
```
