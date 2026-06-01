# PluginDependency

Plugin dependency definition

## Signature

```ts
export interface PluginDependency
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/core.ts#L81-L91)

## Properties

| Name                    | Kind     | Type      | Description                                                                                            |
| ----------------------- | -------- | --------- | ------------------------------------------------------------------------------------------------------ |
| `id`                    | property | `string`  | Dependency plugin id                                                                                   |
| `optional` _(optional)_ | property | `boolean` | Optional dependency flag. If `true`, the plugin will not throw an error if the dependency is not found |

## Tags

- `@since` — v0.27.0
