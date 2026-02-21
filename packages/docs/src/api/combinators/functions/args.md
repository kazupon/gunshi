[gunshi](../../index.md) / [combinators](../index.md) / args

# Function: args()

```ts
function args<T>(fields): T
```

**`Experimental`**

Type-safe schema factory.

Returns the input unchanged at runtime, but provides type inference
so that `satisfies Args` is not needed.

## Type Parameters

| Type Parameter                                           | Description            |
| -------------------------------------------------------- | ---------------------- |
| `T` _extends_ [`Args`](../../default/interfaces/Args.md) | The exact schema type. |

## Parameters

| Parameter | Type | Description                 |
| --------- | ---- | --------------------------- |
| `fields`  | `T`  | The argument schema object. |

## Returns

`T`

The same schema object with its type inferred.

## Example

```ts
const common = args({
  verbose: boolean(),
  help: short(boolean(), 'h')
})
```
