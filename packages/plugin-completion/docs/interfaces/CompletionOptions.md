[**@gunshi/plugin-completion**](../index.md)

***

[@gunshi/plugin-completion](../index.md) / CompletionOptions

# Interface: CompletionOptions

Completion plugin options.

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="config"></a> `config?` | `object` | The completion configuration |
| `config.entry?` | [`CompletionConfig`](CompletionConfig.md) | The entry point [`completion configuration`](CompletionConfig.md). |
| `config.subCommands?` | `Record`\<`string`, [`CompletionConfig`](CompletionConfig.md)\> | The handlers for sub-commands. |
