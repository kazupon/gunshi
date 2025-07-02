**@gunshi/plugin-i18n**

---

# @gunshi/plugin-i18n

The entry point of i18n plugin

## Example

```js
import i18n from '@gunshi/plugin-i18n'
import { cli } from 'gunshi'

const entry = ctx => {
  // ...
}

await cli(process.argv.slice(2), entry, {
  // ...

  plugins: [
    i18n({
      locale: 'ja-JP', // specify the locale you want to use
      translationAdapterFactory: createTranslationAdapter // optional, use default adapter
    })
  ]

  // ...
})
```

## Variables

| Variable                                      | Description                                                     |
| --------------------------------------------- | --------------------------------------------------------------- |
| [DEFAULT_LOCALE](variables/DEFAULT_LOCALE.md) | The default locale string, which format is BCP 47 language tag. |
| [pluginId](variables/pluginId.md)             | The unique identifier for the i18n plugin.                      |

## Functions

| Function                                                          | Description                                   |
| ----------------------------------------------------------------- | --------------------------------------------- |
| [createTranslationAdapter](functions/createTranslationAdapter.md) | -                                             |
| [default](functions/default.md)                                   | i18n plugin                                   |
| [defineI18n](functions/defineI18n.md)                             | Define an i18n-aware command with type safety |
| [withI18nResource](functions/withI18nResource.md)                 | Add i18n resource to an existing command      |

## Classes

| Class                                               | Description                                                                                                                                                                                                                                                                                                                                     |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [DefaultTranslation](classes/DefaultTranslation.md) | Translation adapter. This adapter is used to custom message formatter like [Intlify message format](https://github.com/intlify/vue-i18n/blob/master/spec/syntax.ebnf), [\`Intl.MessageFormat\` (MF2)](https://github.com/tc39/proposal-intl-messageformat), and etc. This adapter will support localization with your preferred message format. |

## Interfaces

| Interface                                                                          | Description                                                                                                                                                                                                                                                                                                                                     |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [I18nCommand](interfaces/I18nCommand.md)                                           | I18n-aware command interface that extends the base Command with resource support                                                                                                                                                                                                                                                                |
| [I18nCommandContext](interfaces/I18nCommandContext.md)                             | Extended command context which provides utilities via i18n plugin. These utilities are available via `CommandContext.extensions['g:i18n']`.                                                                                                                                                                                                     |
| [I18nPluginOptions](interfaces/I18nPluginOptions.md)                               | i18n plugin options                                                                                                                                                                                                                                                                                                                             |
| [TranslationAdapter](interfaces/TranslationAdapter.md)                             | Translation adapter. This adapter is used to custom message formatter like [Intlify message format](https://github.com/intlify/vue-i18n/blob/master/spec/syntax.ebnf), [\`Intl.MessageFormat\` (MF2)](https://github.com/tc39/proposal-intl-messageformat), and etc. This adapter will support localization with your preferred message format. |
| [TranslationAdapterFactoryOptions](interfaces/TranslationAdapterFactoryOptions.md) | Translation adapter factory options.                                                                                                                                                                                                                                                                                                            |

## Type Aliases

| Type Alias                                                             | Description                                              |
| ---------------------------------------------------------------------- | -------------------------------------------------------- |
| [CommandExamplesFetcher](type-aliases/CommandExamplesFetcher.md)       | Command examples fetcher.                                |
| [CommandResource](type-aliases/CommandResource.md)                     | Command resource type for i18n plugin.                   |
| [CommandResourceFetcher](type-aliases/CommandResourceFetcher.md)       | Command resource fetcher.                                |
| [PluginId](type-aliases/PluginId.md)                                   | Type representing the unique identifier for i18n plugin. |
| [TranslationAdapterFactory](type-aliases/TranslationAdapterFactory.md) | Translation adapter factory.                             |
