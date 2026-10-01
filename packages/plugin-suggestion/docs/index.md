# API Documentation

The entry point of suggestion plugin.

## Example

```js
import { cli } from 'gunshi'
import { suggestion } from '@gunshi/plugin-suggestion'

await cli(process.argv.slice(2), command, {
  strict: true,
  plugins: [
    suggestion()
  ]
})
```

## Variables

| Variable | Description |
| ------ | ------ |
| [pluginId](/packages/plugin-suggestion/docs/default/variables/pluginId.md) | The unique identifier for suggestion plugin. |
| [SuggestionErrorKeys](/packages/plugin-suggestion/docs/default/variables/SuggestionErrorKeys.md) | Suggestion error resource keys. |

## Functions

| Function | Description |
| ------ | ------ |
| [defineSuggestNames](/packages/plugin-suggestion/docs/default/functions/defineSuggestNames.md) | Create a suggestion function with resolved options captured in a closure. |
| [levenshtein](/packages/plugin-suggestion/docs/default/functions/levenshtein.md) | Calculate the Levenshtein distance between two strings. |
| [suggestion](/packages/plugin-suggestion/docs/default/functions/suggestion.md) | Suggestion plugin. |

## Interfaces

| Interface | Description |
| ------ | ------ |
| [ResolvedSuggestionOptions](/packages/plugin-suggestion/docs/default/interfaces/ResolvedSuggestionOptions.md) | Resolved suggestion plugin options. |
| [SuggestionOptions](/packages/plugin-suggestion/docs/default/interfaces/SuggestionOptions.md) | Suggestion plugin options. |

## Type Aliases

| Type Alias | Description |
| ------ | ------ |
| [DistanceFunction](/packages/plugin-suggestion/docs/default/type-aliases/DistanceFunction.md) | Distance function for scoring candidate names. |
| [PluginId](/packages/plugin-suggestion/docs/default/type-aliases/PluginId.md) | Type representing the unique identifier for suggestion plugin. |
| [SuggestionErrorCode](/packages/plugin-suggestion/docs/default/type-aliases/SuggestionErrorCode.md) | Suggestion error resource key type. |
| [SuggestNames](/packages/plugin-suggestion/docs/default/type-aliases/SuggestNames.md) | Suggestion function returned by [defineSuggestNames](/packages/plugin-suggestion/docs/default/functions/defineSuggestNames.md). |

