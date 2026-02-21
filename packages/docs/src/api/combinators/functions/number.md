[gunshi](../../index.md) / [combinators](../index.md) / number

# Function: number()

```ts
function number(opts?): CombinatorSchema<number>
```

**`Experimental`**

Create a number argument schema with optional range validation.

Accepts any numeric value (integer or float).

## Parameters

| Parameter | Type                                              | Description    |
| --------- | ------------------------------------------------- | -------------- |
| `opts?`   | [`NumberOptions`](../interfaces/NumberOptions.md) | Range options. |

## Returns

[`CombinatorSchema`](../type-aliases/CombinatorSchema.md)\<`number`\>

A combinator schema that resolves to number.

## Example

```ts
const args = {
  timeout: number({ min: 0, max: 30000 })
}
```
