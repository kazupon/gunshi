[gunshi](../../index.md) / [combinators](../index.md) / boolean

# Function: boolean()

```ts
function boolean(opts?): CombinatorSchema<boolean>
```

**`Experimental`**

Create a boolean argument schema.

Boolean arguments are existence-based. The resolver passes `"true"` or `"false"`
to the parse function based on the presence or negation of the flag.

## Parameters

| Parameter | Type                                                | Description      |
| --------- | --------------------------------------------------- | ---------------- |
| `opts?`   | [`BooleanOptions`](../interfaces/BooleanOptions.md) | Boolean options. |

## Returns

[`CombinatorSchema`](../type-aliases/CombinatorSchema.md)\<`boolean`\>

A combinator schema for boolean flags.

## Example

```ts
const args = {
  color: boolean({ negatable: true })
}
// Usage: --color (true), --no-color (false)
```
