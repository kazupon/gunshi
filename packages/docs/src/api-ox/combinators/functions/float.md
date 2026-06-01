# float

Create a floating-point argument schema with optional range validation.

Rejects `NaN` and `Infinity` values.

## Signature

```ts
declare function float(opts?: FloatOptions): CombinatorSchema<number>
```

## Parameters

| Name   | Type           | Description                 |
| ------ | -------------- | --------------------------- |
| `opts` | `FloatOptions` | Range options. _(optional)_ |

## Returns

`CombinatorSchema<number>` — A combinator schema that resolves to number (float).

## Examples

```ts
const args = {
  ratio: float({ min: 0, max: 1 })
}
```

## Tags

- `@experimental`
