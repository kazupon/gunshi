[**@gunshi/plugin-completion**](../index.md)

***

[@gunshi/plugin-completion](../index.md) / CompletionConfig

# Interface: CompletionConfig

Completion configuration, which structure is similar `bombsh/tab`'s `CompletionConfig`.

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="args"></a> `args?` | `Record`\<`string`, \{ `handler`: [`CompletionHandler`](../type-aliases/CompletionHandler.md); \}\> | The command arguments for the completion. |
| <a id="handler"></a> `handler?` | [`CompletionHandler`](../type-aliases/CompletionHandler.md) | The [`handler`](../type-aliases/CompletionHandler.md) for the completion. |
