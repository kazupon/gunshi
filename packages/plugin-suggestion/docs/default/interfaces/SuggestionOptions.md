# Interface: SuggestionOptions

Suggestion plugin options.

## Signature

```ts
export interface SuggestionOptions
```

## Properties

| Name | Type | Description |
| --- | --- | --- |
| `distance` _(optional)_ | [`DistanceFunction`](/packages/plugin-suggestion/docs/default/type-aliases/DistanceFunction.md) | Distance function used for ranking candidates. **Default:** `levenshtein` |
| `includeCommands` _(optional)_ | `boolean` | Whether to suggest known commands for command-not-found errors. **Default:** `true` |
| `includeOptions` _(optional)_ | `boolean` | Whether to suggest known long options for unknown option errors. **Default:** `true` |
| `maxDistance` _(optional)_ | `number` | Maximum distance allowed for a candidate. **Default:** `2` |
| `maxSuggestions` _(optional)_ | `number` | Maximum number of suggestions to render for one error. **Default:** `1` |
| `normalize` _(optional)_ | `(value: string) => string` | Normalize typed input and candidates before distance calculation. **Default:** `value => value` |

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
