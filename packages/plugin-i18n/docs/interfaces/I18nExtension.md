[**@gunshi/plugin-i18n**](../index.md)

***

[@gunshi/plugin-i18n](../index.md) / I18nExtension

# Interface: I18nExtension\<G\>

Extended command context which provides utilities via i18n plugin.
These utilities are available via `CommandContext.extensions['g:i18n']`.

## Type Parameters

| Type Parameter | Default type | Description |
| ------ | ------ | ------ |
| `G` *extends* `GunshiParams`\<`any`\> | `DefaultGunshiParams` | Type parameter extending `GunshiParams` |

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="loadresource"></a> `loadResource` | (`locale`, `ctx`, `command`) => `Promise`\<`boolean`\> | Load command resources. |
| <a id="locale"></a> `locale` | `Locale` | Command locale |
| <a id="translate"></a> `translate` | \<`A`, `C`, `E`, `K`\>(`key`, `values?`) => `string` | Translate a message. |
