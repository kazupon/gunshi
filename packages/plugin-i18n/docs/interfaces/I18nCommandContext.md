[**@gunshi/plugin-i18n**](../index.md)

***

[@gunshi/plugin-i18n](../index.md) / I18nCommandContext

# Interface: I18nCommandContext\<G\>

Extended command context which provides utilities via i18n plugin.
These utilities are available via `CommandContext.extensions['g:i18n']`.

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `G` *extends* `GunshiParams`\<`any`\> | `DefaultGunshiParams` |

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="locale"></a> `locale` | `string` \| `Locale` | Command locale |
| <a id="translate"></a> `translate` | \<`T`, `O`, `K`\>(`key`, `values?`) => `string` | Translate a message |
