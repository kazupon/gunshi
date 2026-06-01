# withDefault

Set a default value on a combinator schema.

The original schema is not modified.

## Signature

```ts
declare function withDefault<T extends string | boolean | number>(
  schema: CombinatorSchema<T>,
  defaultValue: T
): CombinatorSchema<T> & CombinatorWithDefault<T>
```

## Type Parameters

| Name                                        | Description               |
| ------------------------------------------- | ------------------------- |
| `T` _extends_ `string \| boolean \| number` | The schema's parsed type. |

## Parameters

| Name           | Type                  | Description                 |
| -------------- | --------------------- | --------------------------- |
| `schema`       | `CombinatorSchema<T>` | The base combinator schema. |
| `defaultValue` | `T`                   | The default value.          |

## Returns

`CombinatorSchema<T> & CombinatorWithDefault<T>` — A new schema with the default value set.

## Examples

```ts
const args = {
  port: withDefault(integer({ min: 1, max: 65535 }), 8080)
}
```

## Tags

- `@experimental`
