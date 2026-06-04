# Interface: PluginDependency

Plugin dependency definition

## Since

v0.27.0

## Signature

```ts
export interface PluginDependency
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L81-L91)

## Properties

| Name                    | Type                                                  | Description                                                                                            |
| ----------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `id`                    | [`string`](/api-ox/combinators/functions/string.md)   | Dependency plugin id                                                                                   |
| `optional` _(optional)_ | [`boolean`](/api-ox/combinators/functions/boolean.md) | Optional dependency flag. If `true`, the plugin will not throw an error if the dependency is not found |
