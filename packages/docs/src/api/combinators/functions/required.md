[gunshi](../../index.md) / [combinators](../index.md) / required

# Function: required()

```ts
function required<T>(schema): ArgSchema & Combinator<T> & CombinatorRequired
```

**`Experimental`**

Mark a combinator schema as required.

The original schema is not modified.

## Type Parameters

| Type Parameter | Description               |
| -------------- | ------------------------- |
| `T`            | The schema's parsed type. |

## Parameters

| Parameter | Type                                                             | Description                 |
| --------- | ---------------------------------------------------------------- | --------------------------- |
| `schema`  | [`CombinatorSchema`](../type-aliases/CombinatorSchema.md)\<`T`\> | The base combinator schema. |

## Returns

[`ArgSchema`](../../default/interfaces/ArgSchema.md) & [`Combinator`](../type-aliases/Combinator.md)\<`T`\> & `CombinatorRequired`

A new schema with `required: true`.

## Example

```ts
const args = {
  name: required(string())
}
```
