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
