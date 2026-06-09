# Interface: CompletionConfig

Completion configuration, which structure is similar `bombsh/tab`'s `CompletionConfig`.

## Signature

```ts
export interface CompletionConfig
```

## Properties

| Name | Type | Description |
| --- | --- | --- |
| `args` _(optional)_ | `Record`\<`string`, { `handler`: [`CompletionHandler`](/packages/plugin-completion/docs/default/type-aliases/CompletionHandler.md) }\> | The command arguments for the completion. |
| `handler` _(optional)_ | [`CompletionHandler`](/packages/plugin-completion/docs/default/type-aliases/CompletionHandler.md) | The [`handler`](/packages/plugin-completion/docs/default/type-aliases/CompletionHandler.md) for the completion. |

### handler Parameters

| Name | Type | Description |
| --- | --- | --- |
| `params` | [`CompletionParams`](/packages/plugin-completion/docs/default/interfaces/CompletionParams.md) |  |

### handler Returns

`Completion[]`
