[gunshi](../../index.md) / [combinators](../index.md) / string

# Function: string()

```ts
function string(opts?): CombinatorSchema<string>
```

**`Experimental`**

Create a string argument schema with optional validation.

## Parameters

| Parameter | Type                                              | Description         |
| --------- | ------------------------------------------------- | ------------------- |
| `opts?`   | [`StringOptions`](../interfaces/StringOptions.md) | Validation options. |

## Returns

[`CombinatorSchema`](../type-aliases/CombinatorSchema.md)\<`string`\>

A combinator schema that resolves to string.

## Example

```ts
const args = {
  name: string({ minLength: 1, maxLength: 50 })
}
```
