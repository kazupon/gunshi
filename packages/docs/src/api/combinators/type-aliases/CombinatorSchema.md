[gunshi](../../index.md) / [combinators](../index.md) / CombinatorSchema

# Type Alias: CombinatorSchema\<T\>

```ts
type CombinatorSchema<T> = ArgSchema & Combinator<T>
```

**`Experimental`**

A schema produced by combinator factory functions.
Any [ArgSchema](../../default/interfaces/ArgSchema.md) with a parse function qualifies.

## Type Parameters

| Type Parameter | Description            |
| -------------- | ---------------------- |
| `T`            | The parsed value type. |
