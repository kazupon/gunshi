[**@gunshi/plugin-renderer**](../index.md)

***

[@gunshi/plugin-renderer](../index.md) / UsageRendererExtension

# Interface: UsageRendererExtension\<G\>

Extended command context which provides utilities via usage renderer plugin.
These utilities are available via `CommandContext.extensions['g:renderer']`.

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `G` *extends* `GunshiParams`\<`any`\> | `DefaultGunshiParams` |

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="loadcommands"></a> `loadCommands` | \<`G`\>() => `Promise`\<`Command`\<`G`\>[]\> | Load commands |
| <a id="text"></a> `text` | \<`T`, `O`, `K`\>(`key`, `values?`) => `Promise`\<`string`\> | Render the text message |
