[gunshi](../../index.md) / [combinators](../index.md) / multiple

# Function: multiple()

```ts
function multiple<T>(schema): ArgSchema & Combinator<T> & CombinatorMultiple
```

**`Experimental`**

Mark a combinator schema as accepting multiple values.

The resolved value becomes an array. The original schema is not modified.

## Type Parameters

| Type Parameter | Description               |
| -------------- | ------------------------- |
| `T`            | The schema's parsed type. |

## Parameters

| Parameter | Type                                                             | Description                 |
| --------- | ---------------------------------------------------------------- | --------------------------- |
| `schema`  | [`CombinatorSchema`](../type-aliases/CombinatorSchema.md)\<`T`\> | The base combinator schema. |

## Returns

[`ArgSchema`](../../default/interfaces/ArgSchema.md) & [`Combinator`](../type-aliases/Combinator.md)\<`T`\> & `CombinatorMultiple`

A new schema with `multiple: true`.

## Example

```ts
const args = {
  tags: multiple(string())
}
// typeof values.tags === string[]
```
