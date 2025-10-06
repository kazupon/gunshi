[**@gunshi/plugin-completion**](../index.md)

***

[@gunshi/plugin-completion](../index.md) / CompletionHandler

# Type Alias: CompletionHandler()

```ts
type CompletionHandler = (params) => Completion[];
```

The handler for completion.

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `params` | [`CompletionParams`](../interfaces/CompletionParams.md) | The [`parameters`](../interfaces/CompletionParams.md) for the completion handler. |

## Returns

`Completion`[]

An array of Completion \| completions.
