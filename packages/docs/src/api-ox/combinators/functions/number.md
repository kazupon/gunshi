# number

Create a number argument schema with optional range validation.

Accepts any numeric value (integer or float).

## Signature

```ts
declare function number(opts?: NumberOptions): CombinatorSchema<number>
```

## Parameters

| Name   | Type            | Description                 |
| ------ | --------------- | --------------------------- |
| `opts` | `NumberOptions` | Range options. _(optional)_ |

## Returns

`CombinatorSchema<number>` — A combinator schema that resolves to number.

## Examples

```ts
const args = {
  timeout: number({ min: 0, max: 30000 })
}
```

## Tags

- `@experimental`
