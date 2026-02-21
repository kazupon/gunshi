[gunshi](../../index.md) / [combinators](../index.md) / Combinator

# Type Alias: Combinator\<T\>

```ts
type Combinator<T> = object
```

**`Experimental`**

A combinator produced by combinator factory functions.

## Type Parameters

| Type Parameter | Description            |
| -------------- | ---------------------- |
| `T`            | The parsed value type. |

## Properties

| Property                   | Type             | Description                                                    |
| -------------------------- | ---------------- | -------------------------------------------------------------- |
| <a id="parse"></a> `parse` | (`value`) => `T` | The parse function that converts a string to the desired type. |
