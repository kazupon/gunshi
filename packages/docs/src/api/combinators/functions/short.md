[gunshi](../../index.md) / [combinators](../index.md) / short

# Function: short()

```ts
function short<T, S>(schema, alias): ArgSchema & Combinator<T> & CombinatorShort<S>
```

**`Experimental`**

Set a short alias on a combinator schema.

The original schema is not modified.

## Type Parameters

| Type Parameter         | Description                          |
| ---------------------- | ------------------------------------ |
| `T`                    | The schema's parsed type.            |
| `S` _extends_ `string` | The short alias string literal type. |

## Parameters

| Parameter | Type                                                             | Description                   |
| --------- | ---------------------------------------------------------------- | ----------------------------- |
| `schema`  | [`CombinatorSchema`](../type-aliases/CombinatorSchema.md)\<`T`\> | The base combinator schema.   |
| `alias`   | `S`                                                              | Single character short alias. |

## Returns

[`ArgSchema`](../../default/interfaces/ArgSchema.md) & [`Combinator`](../type-aliases/Combinator.md)\<`T`\> & `CombinatorShort`\<`S`\>

A new schema with the short alias set.

## Example

```ts
const args = {
  verbose: short(boolean(), 'v')
}
// Usage: -v or --verbose
```
