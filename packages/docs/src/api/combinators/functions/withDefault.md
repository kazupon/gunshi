[gunshi](../../index.md) / [combinators](../index.md) / withDefault

# Function: withDefault()

```ts
function withDefault<T>(schema, defaultValue): ArgSchema & Combinator<T> & CombinatorWithDefault<T>
```

**`Experimental`**

Set a default value on a combinator schema.

The original schema is not modified.

## Type Parameters

| Type Parameter                                  | Description               |
| ----------------------------------------------- | ------------------------- |
| `T` _extends_ `string` \| `number` \| `boolean` | The schema's parsed type. |

## Parameters

| Parameter      | Type                                                             | Description                 |
| -------------- | ---------------------------------------------------------------- | --------------------------- |
| `schema`       | [`CombinatorSchema`](../type-aliases/CombinatorSchema.md)\<`T`\> | The base combinator schema. |
| `defaultValue` | `T`                                                              | The default value.          |

## Returns

[`ArgSchema`](../../default/interfaces/ArgSchema.md) & [`Combinator`](../type-aliases/Combinator.md)\<`T`\> & `CombinatorWithDefault`\<`T`\>

A new schema with the default value set.

## Example

```ts
const args = {
  port: withDefault(integer({ min: 1, max: 65535 }), 8080)
}
```
