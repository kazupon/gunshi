[gunshi](../../index.md) / [combinators](../index.md) / unrequired

# Function: unrequired()

```ts
function unrequired<T>(schema): ArgSchema & Combinator<T> & CombinatorUnrequired
```

**`Experimental`**

Mark a combinator schema as not required.

Useful for overriding a base combinator that was created with `required: true`.
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

[`ArgSchema`](../../default/interfaces/ArgSchema.md) & [`Combinator`](../type-aliases/Combinator.md)\<`T`\> & `CombinatorUnrequired`

A new schema with `required: false`.

## Example

```ts
const args = {
  name: unrequired(string({ required: true }))
}
```
