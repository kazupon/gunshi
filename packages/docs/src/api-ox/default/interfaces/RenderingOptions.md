# Interface: RenderingOptions\<G\>

Rendering control options

## Since

v0.27.0

## Signature

```ts
export interface RenderingOptions<G extends GunshiParamsConstraint = DefaultGunshiParams>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L520-L546)

## Type Parameters

| Name                                                                                                                                                                            | Description                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `G` _extends_ [`GunshiParamsConstraint`](/api-ox/default/type-aliases/GunshiParamsConstraint.md) = [`DefaultGunshiParams`](/api-ox/default/type-aliases/DefaultGunshiParams.md) | A type extending [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) to specify the shape of render options. |

## Properties

| Name                            | Type              | Description                                                                                                                                                |
| ------------------------------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `header` _(optional)_           | `unknown \| null` | Header rendering configuration - `null`: Disable rendering - `function`: Use custom renderer - `undefined` (when omitted): Use default renderer            |
| `usage` _(optional)_            | `unknown \| null` | Usage rendering configuration - `null`: Disable rendering - `function`: Use custom renderer - `undefined` (when omitted): Use default renderer             |
| `validationErrors` _(optional)_ | `unknown \| null` | Validation errors rendering configuration - `null`: Disable rendering - `function`: Use custom renderer - `undefined` (when omitted): Use default renderer |
