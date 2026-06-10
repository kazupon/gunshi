# Type Alias: CompletionHandler

The handler for completion.

## Signature

```ts
export type CompletionHandler = (params: CompletionParams) => Completion[]
```

## Parameters

| Name | Type | Description |
| --- | --- | --- |
| `params` | [`CompletionParams`](/packages/plugin-completion/docs/default/interfaces/CompletionParams.md) | The [`parameters`](/packages/plugin-completion/docs/default/interfaces/CompletionParams.md) for the completion handler. |

## Returns

`Completion[]` — An array of `completions`.
