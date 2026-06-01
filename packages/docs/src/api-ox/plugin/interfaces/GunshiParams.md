# GunshiParams

Gunshi unified parameter type.

This type combines both argument definitions and command context extensions.

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

| Name                                                                                         | Description                                                        |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `P` _extends_ `{ args?: Args extensions?: ExtendContext }` = `{ args: Args extensions: {} }` | The type of parameters, which can include `args` and `extensions`. |

## Properties

| Name         | Kind     | Type      | Description                   |
| ------------ | -------- | --------- | ----------------------------- |
| `args`       | property | `unknown` | Command argument definitions. |
| `extensions` | property | `unknown` | Command context extensions.   |

## Tags

- `@since` — v0.27.0
