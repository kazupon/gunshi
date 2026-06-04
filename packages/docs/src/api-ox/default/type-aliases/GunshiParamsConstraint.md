# Type Alias: GunshiParamsConstraint

Generic constraint for command-related types.

This type constraint allows both [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) and objects with extensions.

## Since

v0.27.0

## Signature

```ts
export type GunshiParamsConstraint =
  | GunshiParams<any>
  | {
      args: Args
    }
  | {
      extensions: ExtendContext
    }
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L76-L83)
