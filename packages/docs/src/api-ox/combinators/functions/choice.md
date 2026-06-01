# choice

Create an enum-like argument schema with literal type inference.

Uses `const T` generic to infer literal union types from the values array.

## Signature

```ts
declare function choice<const T extends readonly string[]>(
  values: T,
  opts?: BaseOptions
): CombinatorSchema<T[number]>
```

## Type Parameters

| Name                              | Description                                  |
| --------------------------------- | -------------------------------------------- |
| `T` _extends_ `readonly string[]` | The readonly array of allowed string values. |

## Parameters

| Name     | Type          | Description                                                 |
| -------- | ------------- | ----------------------------------------------------------- |
| `values` | `T`           | Allowed values.                                             |
| `opts`   | `BaseOptions` | Common options (description, short, required). _(optional)_ |

## Returns

`CombinatorSchema<T[number]>` — A combinator schema that resolves to a union of the allowed values.

## Examples

```ts
const args = {
  level: choice(['debug', 'info', 'warn', 'error'] as const)
}
// typeof values.level === 'debug' | 'info' | 'warn' | 'error'
```

## Tags

- `@experimental`
