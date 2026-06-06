[**@gunshi/plugin-dryrun**](../index.md)

***

[@gunshi/plugin-dryrun](../index.md) / DryRunPluginOptions

# Interface: DryRunPluginOptions

dry-run plugin options.

## Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| <a id="property-description"></a> `description?` | `string` | fallback dry-run option description. |
| <a id="property-descriptionresources"></a> `descriptionResources?` | `Record`\<`string`, `string`\> | localized dry-run option descriptions, used with `@gunshi/plugin-i18n`. |
| <a id="property-name"></a> `name?` | `string` | command values key for dry-run option. **Default** `'dryRun'` |
| <a id="property-prefix"></a> `prefix?` | `string` | dry-run output prefix. **Default** `'[dryrun]'` |
