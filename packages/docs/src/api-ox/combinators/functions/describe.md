# describe

Set a description on a combinator schema for help text generation.

The original schema is not modified.

## Signature

```ts
declare function describe<T, D extends string>(
  schema: CombinatorSchema<T>,
  text: D
): CombinatorSchema<T> & CombinatorDescribe<D>
```

## Type Parameters

| Name                   | Description                          |
| ---------------------- | ------------------------------------ |
| `T`                    | The schema's parsed type.            |
| `D` _extends_ `string` | The description string literal type. |

## Parameters

| Name     | Type                  | Description                 |
| -------- | --------------------- | --------------------------- |
| `schema` | `CombinatorSchema<T>` | The base combinator schema. |
| `text`   | `D`                   | Human-readable description. |

## Returns

`CombinatorSchema<T> & CombinatorDescribe<D>` — A new schema with the description set.

## Examples

```ts
const args = {
  port: describe(integer(), 'Port number to listen on')
}
```

## Tags

- `@experimental`
