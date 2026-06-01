# short

Set a short alias on a combinator schema.

The original schema is not modified.

## Signature

```ts
declare function short<T, S extends string>(
  schema: CombinatorSchema<T>,
  alias: S
): CombinatorSchema<T> & CombinatorShort<S>
```

## Type Parameters

| Name                   | Description                          |
| ---------------------- | ------------------------------------ |
| `T`                    | The schema's parsed type.            |
| `S` _extends_ `string` | The short alias string literal type. |

## Parameters

| Name     | Type                  | Description                   |
| -------- | --------------------- | ----------------------------- |
| `schema` | `CombinatorSchema<T>` | The base combinator schema.   |
| `alias`  | `S`                   | Single character short alias. |

## Returns

`CombinatorSchema<T> & CombinatorShort<S>` — A new schema with the short alias set.

## Examples

```ts
const args = {
  verbose: short(boolean(), 'v')
}
// Usage: -v or --verbose
```

## Tags

- `@experimental`
