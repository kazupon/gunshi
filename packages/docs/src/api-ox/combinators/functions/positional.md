# positional

Create a positional argument schema.

Without a parser, resolves to string.
With a parser (e.g., `positional(integer())`), resolves to the parser's return type.

## Signature

```ts
declare function positional(parser?: BaseOptions): ArgSchema & ArgSchemaPositionalType
```

## Parameters

| Name     | Type          | Description                                                        |
| -------- | ------------- | ------------------------------------------------------------------ |
| `parser` | `BaseOptions` | Optional base options (description, short, required). _(optional)_ |

## Returns

`ArgSchema & ArgSchemaPositionalType` — A positional argument schema resolving to string.

## Examples

```ts
const args = {
  command: positional(), // resolves to string
  port: positional(integer()) // resolves to number
}
```

## Tags

- `@experimental`
