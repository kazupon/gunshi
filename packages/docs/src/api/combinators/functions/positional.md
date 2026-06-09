# Function: positional()

## Call Signature

```ts
declare function positional<T>(parser: CombinatorSchema<T>): CombinatorSchema<T> & ArgSchemaPositionalType
```

> [!WARNING]
> This API is experimental and may change in future versions.

Create a positional argument schema.

Without a parser, resolves to string.
With a parser (e.g., `positional(integer())`), resolves to the parser's return type.

### Type Parameters

| Name | Description |
| --- | --- |
| `T` | The parser's resolved type. |

### Parameters

| Name | Type | Description |
| --- | --- | --- |
| `parser` | [`CombinatorSchema`](/api/combinators/type-aliases/CombinatorSchema.md)\<`T`\> | The parser combinator schema. |

### Returns

[`CombinatorSchema`](/api/combinators/type-aliases/CombinatorSchema.md)\<`T`\> & `ArgSchemaPositionalType` — A positional argument schema resolving to the parser's type.

### Examples

```ts
const args = {
  command: positional(),           // resolves to string
  port: positional(integer()),     // resolves to number
}
```

## Call Signature

```ts
declare function positional(parser?: BaseOptions): ArgSchema & ArgSchemaPositionalType
```

> [!WARNING]
> This API is experimental and may change in future versions.

Create a positional argument schema.

Without a parser, resolves to string.
With a parser (e.g., `positional(integer())`), resolves to the parser's return type.

### Parameters

| Name | Type | Description |
| --- | --- | --- |
| `parser` | [`BaseOptions`](/api/combinators/interfaces/BaseOptions.md) | Optional base options (description, short, required). _(optional)_ |

### Returns

[`ArgSchema`](/api/default/interfaces/ArgSchema.md) & `ArgSchemaPositionalType` — A positional argument schema resolving to string.

### Examples

```ts
const args = {
  command: positional(),           // resolves to string
  port: positional(integer()),     // resolves to number
}
```
