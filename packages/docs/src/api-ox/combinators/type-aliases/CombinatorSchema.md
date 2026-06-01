# CombinatorSchema

A schema produced by combinator factory functions.
Any [ArgSchema](/api-ox/default/interfaces/ArgSchema.md) with a parse function qualifies.

## Signature

```ts
type CombinatorSchema<T> = ArgSchema & Combinator<T>
```

## Type Parameters

| Name | Description            |
| ---- | ---------------------- |
| `T`  | The parsed value type. |

## Tags

- `@experimental`
