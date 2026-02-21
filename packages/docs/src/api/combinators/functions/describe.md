[gunshi](../../index.md) / [combinators](../index.md) / describe

# Function: describe()

```ts
function describe<T, D>(schema, text): ArgSchema & Combinator<T> & CombinatorDescribe<D>
```

**`Experimental`**

Set a description on a combinator schema for help text generation.

The original schema is not modified.

## Type Parameters

| Type Parameter         | Description                          |
| ---------------------- | ------------------------------------ |
| `T`                    | The schema's parsed type.            |
| `D` _extends_ `string` | The description string literal type. |

## Parameters

| Parameter | Type                                                             | Description                 |
| --------- | ---------------------------------------------------------------- | --------------------------- |
| `schema`  | [`CombinatorSchema`](../type-aliases/CombinatorSchema.md)\<`T`\> | The base combinator schema. |
| `text`    | `D`                                                              | Human-readable description. |

## Returns

[`ArgSchema`](../../default/interfaces/ArgSchema.md) & [`Combinator`](../type-aliases/Combinator.md)\<`T`\> & `CombinatorDescribe`\<`D`\>

A new schema with the description set.

## Example

```ts
const args = {
  port: describe(integer(), 'Port number to listen on')
}
```
