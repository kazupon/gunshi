# Interface: ResolvedSuggestionOptions

Resolved suggestion plugin options.

## Signature

```ts
export interface ResolvedSuggestionOptions
```

## Properties

| Name | Type | Description |
| --- | --- | --- |
| `distance` | [`DistanceFunction`](/packages/plugin-suggestion/docs/default/type-aliases/DistanceFunction.md) | Distance function used for ranking candidates. |
| `includeCommands` | `boolean` | Whether to suggest known commands for command-not-found errors. |
| `includeOptions` | `boolean` | Whether to suggest known long options for unknown option errors. |
| `maxDistance` | `number` | Maximum distance allowed for a candidate. |
| `maxSuggestions` | `number` | Maximum number of suggestions to render for one error. |
| `normalize` | `(value: string) => string` | Normalize typed input and candidates before distance calculation. |

### distance Parameters

| Name | Type | Description |
| --- | --- | --- |
| `input` | `string` |  |
| `candidate` | `string` |  |

### distance Returns

`number`

### normalize Parameters

| Name | Type | Description |
| --- | --- | --- |
| `value` | `string` |  |

### normalize Returns

`string`
