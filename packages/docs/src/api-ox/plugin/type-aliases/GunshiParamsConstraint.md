# GunshiParamsConstraint

Generic constraint for command-related types.

This type constraint allows both [`GunshiParams`](/api-ox/plugin/interfaces/GunshiParams.md) and objects with extensions.

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

## Tags

- `@since` — v0.27.0
