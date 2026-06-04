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

| Name   | Type                                                                 | Description                   |
| ------ | -------------------------------------------------------------------- | ----------------------------- |
| `opts` | [`BooleanOptions`](/api-ox/combinators/interfaces/BooleanOptions.md) | Boolean options. _(optional)_ |

## Returns

[`CombinatorSchema`](/api-ox/combinators/type-aliases/CombinatorSchema.md)\<[`boolean`](/api-ox/combinators/functions/boolean.md)\> — A combinator schema for boolean flags.

## Examples

```ts
const args = {
  color: boolean({ negatable: true })
}
// Usage: --color (true), --no-color (false)
```
