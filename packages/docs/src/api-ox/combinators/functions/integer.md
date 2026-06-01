# integer

Create an integer argument schema with optional range validation.

Only accepts integer values (no decimals).

## Signature

```ts
declare function integer(opts?: IntegerOptions): CombinatorSchema<number>
```

## Parameters

| Name   | Type             | Description                 |
| ------ | ---------------- | --------------------------- |
| `opts` | `IntegerOptions` | Range options. _(optional)_ |

## Returns

`CombinatorSchema<number>` — A combinator schema that resolves to number (integer).

## Examples

```ts
const args = {
  retries: integer({ min: 0, max: 10 })
}
```

## Tags

- `@experimental`
