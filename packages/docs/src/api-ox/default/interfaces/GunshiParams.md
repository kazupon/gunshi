# Interface: GunshiParams\<P\>

Gunshi unified parameter type.

This type combines both argument definitions and command context extensions.

## Since

v0.27.0

## Signature

```ts
export interface GunshiParams<
  P extends {
    args?: Args
    extensions?: ExtendContext
  } = {
    args: Args
    extensions: {}
  }
>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L42-L59)

## Type Parameters

| Name | Description |
| ---- | ----------- |

| `P` _extends_ {
[`args`](/api-ox/combinators/functions/args.md)?: [`Args`](/api-ox/default/interfaces/Args.md)
`extensions`?: [`ExtendContext`](/api-ox/default/type-aliases/ExtendContext.md)
} = {
[`args`](/api-ox/combinators/functions/args.md): [`Args`](/api-ox/default/interfaces/Args.md)
`extensions`: {}
} | The type of parameters, which can include `args` and `extensions`. |

## Properties

| Name         | Type      | Description                   |
| ------------ | --------- | ----------------------------- |
| `args`       | `unknown` | Command argument definitions. |
| `extensions` | `unknown` | Command context extensions.   |
