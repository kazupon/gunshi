# Prettify

Prettify a type by flattening its structure.

## Signature

```ts
export type Prettify<T> = { [K in keyof T]: T[K] } & {}
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L23)

## Type Parameters

| Name | Description                |
| ---- | -------------------------- |
| `T`  | The type to be prettified. |
