# Function: boolean()

> [!WARNING]
> This API is experimental and may change in future versions.

Create a boolean argument schema.

Boolean arguments are existence-based. The resolver passes `"true"` or `"false"`
to the parse function based on the presence or negation of the flag.

## Signature

```ts
declare function boolean(opts?: BooleanOptions): CombinatorSchema<boolean>
```

## Parameters

| Name | Type | Description |
| --- | --- | --- |
| `opts` | [`BooleanOptions`](/api/combinators/interfaces/BooleanOptions.md) | Boolean options. _(optional)_ |

## Returns

[`CombinatorSchema`](/api/combinators/type-aliases/CombinatorSchema.md)\<`boolean`\> — A combinator schema for boolean flags.

## Examples

```ts
const args = {
  color: boolean({ negatable: true })
}
// Usage: --color (true), --no-color (false)
```
