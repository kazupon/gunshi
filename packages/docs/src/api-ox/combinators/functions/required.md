# required

Mark a combinator schema as required.

The original schema is not modified.

## Signature

```ts
declare function required<T>(schema: CombinatorSchema<T>): CombinatorSchema<T> & CombinatorRequired
```

## Type Parameters

| Name | Description               |
| ---- | ------------------------- |
| `T`  | The schema's parsed type. |

## Parameters

| Name     | Type                  | Description                 |
| -------- | --------------------- | --------------------------- |
| `schema` | `CombinatorSchema<T>` | The base combinator schema. |

## Returns

`CombinatorSchema<T> & CombinatorRequired` — A new schema with `required: true`.

## Examples

```ts
const args = {
  name: required(string())
}
```

## Tags

- `@experimental`
