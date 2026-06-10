# Interface: I18nPluginOptions

i18n plugin options

## Signature

```ts
export interface I18nPluginOptions
```

## Properties

| Name | Type | Description |
| --- | --- | --- |
| `builtinResources` _(optional)_ | `Record<string, Record<BuiltinResourceKeys, string>>` | Built-in localizable resources |
| `locale` _(optional)_ | `string \| Intl.Locale` | Locale to use for translations |
| `translationAdapterFactory` _(optional)_ | [`TranslationAdapterFactory`](/packages/plugin-i18n/docs/default/type-aliases/TranslationAdapterFactory.md) | Translation adapter factory |
