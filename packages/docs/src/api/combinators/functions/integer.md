[gunshi](../../index.md) / [combinators](../index.md) / integer

# Function: integer()

```ts
function integer(opts?): CombinatorSchema<number>
```

**`Experimental`**

Create an integer argument schema with optional range validation.

Only accepts integer values (no decimals).

## Parameters

| Parameter | Type                                                | Description    |
| --------- | --------------------------------------------------- | -------------- |
| `opts?`   | [`IntegerOptions`](../interfaces/IntegerOptions.md) | Range options. |

## Returns

[`CombinatorSchema`](../type-aliases/CombinatorSchema.md)\<`number`\>

A combinator schema that resolves to number (integer).

## Example

```ts
const args = {
  retries: integer({ min: 0, max: 10 })
}
```
