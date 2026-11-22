# Interface: I18nPluginOptions

i18n plugin options

## Signature

```ts
export interface I18nPluginOptions
```

## Properties

| Name | Type | Description |
| --- | --- | --- |
| `builtinResources` _(optional)_ | `Record<string, BuiltinResource>` | Built-in localizable resources |
| `locale` _(optional)_ | `string \| Intl.Locale` | Locale to use for translations: a BCP 47 language tag, such as `ja-JP`, an `Intl.Locale`, or a POSIX locale, such as `ja_JP.UTF-8` of `LANG`, which is used as the language tag of its language and territory, `ja-JP`. `C`, `POSIX` and an empty string are the default locale, `en-US` |
| `translationAdapterFactory` _(optional)_ | [`TranslationAdapterFactory`](/packages/plugin-i18n/docs/default/type-aliases/TranslationAdapterFactory.md) | Translation adapter factory |
