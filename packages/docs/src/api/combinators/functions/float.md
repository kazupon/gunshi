[gunshi](../../index.md) / [combinators](../index.md) / float

# Function: float()

```ts
function float(opts?): CombinatorSchema<number>
```

**`Experimental`**

Create a floating-point argument schema with optional range validation.

Rejects `NaN` and `Infinity` values.

## Parameters

| Parameter | Type                                            | Description    |
| --------- | ----------------------------------------------- | -------------- |
| `opts?`   | [`FloatOptions`](../interfaces/FloatOptions.md) | Range options. |

## Returns

[`CombinatorSchema`](../type-aliases/CombinatorSchema.md)\<`number`\>

A combinator schema that resolves to number (float).

## Example

```ts
const args = {
  ratio: float({ min: 0, max: 1 })
}
```
