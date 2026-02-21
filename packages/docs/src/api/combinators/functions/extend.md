[gunshi](../../index.md) / [combinators](../index.md) / extend

# Function: extend()

```ts
function extend<T, U>(base, overrides): Omit<T, keyof U> & U
```

**`Experimental`**

Extend a schema by overriding or adding fields.

Equivalent to `merge(base, overrides)` but communicates the intent of
intentional overrides rather than general composition.

## Type Parameters

| Type Parameter                                           | Description            |
| -------------------------------------------------------- | ---------------------- |
| `T` _extends_ [`Args`](../../default/interfaces/Args.md) | Base schema type.      |
| `U` _extends_ [`Args`](../../default/interfaces/Args.md) | Overrides schema type. |

## Parameters

| Parameter   | Type | Description                |
| ----------- | ---- | -------------------------- |
| `base`      | `T`  | The base schema to extend. |
| `overrides` | `U`  | Fields to override or add. |

## Returns

`Omit`\<`T`, keyof `U`\> & `U`

A new schema with overrides applied.

## Example

```ts
const base = args({ port: withDefault(integer(), 8080) })
const strict = extend(base, { port: required(integer({ min: 1, max: 65535 })) })
```
