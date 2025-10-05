**@gunshi/plugin-i18n**

***

# @gunshi/plugin-i18n

The entry point of i18n plugin

## Example

```js
import i18n from '@gunshi/plugin-i18n'
import { cli } from 'gunshi'

const entry = (ctx) => {
  // ...
}

await cli(process.argv.slice(2), entry, {
  // ...

  plugins: [
    i18n({
      locale: 'ja-JP', // specify the locale you want to use
      translationAdapterFactory: createTranslationAdapter, // optional, use default adapter
    })
  ],

  // ...
})
```

## Variables

| Variable | Description |
| ------ | ------ |
| [DEFAULT\_LOCALE](variables/DEFAULT_LOCALE.md) | The default locale string, which format is BCP 47 language tag. |
| [pluginId](variables/pluginId.md) | The unique identifier for the i18n plugin. |

## Functions

| Function | Description |
| ------ | ------ |
| [createTranslationAdapter](functions/createTranslationAdapter.md) | Create a translation adapter. |
| [default](functions/default.md) | i18n plugin |
| [defineI18n](functions/defineI18n.md) | Define a [command](interfaces/I18nCommand.md). |
| [defineI18nWithTypes](functions/defineI18nWithTypes.md) | Define an i18n-aware [command](interfaces/I18nCommand.md) with types |
| [resolveArgKey](functions/resolveArgKey.md) | Resolve a namespaced key for argument resources. Argument keys are prefixed with "arg:". If the command name is provided, it will be prefixed with the command name (e.g. "cmd1:arg:foo"). |
| [resolveBuiltInKey](functions/resolveBuiltInKey.md) | Resolve a namespaced key for built-in resources. Built-in keys are prefixed with "_:". |
| [resolveKey](functions/resolveKey.md) | Resolve a namespaced key for non-built-in resources. Non-built-in keys are not prefixed with any special characters. If the command name is provided, it will be prefixed with the command name (e.g. "cmd1:foo"). |
| [withI18nResource](functions/withI18nResource.md) | Add i18n resource to an existing command |

## Classes

| Class | Description |
| ------ | ------ |
| [DefaultTranslation](classes/DefaultTranslation.md) | Default implementation of [TranslationAdapter](interfaces/TranslationAdapter.md). |

## Interfaces

| Interface | Description |
| ------ | ------ |
| [I18nCommand](interfaces/I18nCommand.md) | I18n-aware command interface that extends the base Command with resource support |
| [I18nExtension](interfaces/I18nExtension.md) | Extended command context which provides utilities via i18n plugin. These utilities are available via `CommandContext.extensions['g:i18n']`. |
| [I18nPluginOptions](interfaces/I18nPluginOptions.md) | i18n plugin options |
| [TranslationAdapter](interfaces/TranslationAdapter.md) | Translation adapter. This adapter is used to custom message formatter like [Intlify message format](https://github.com/intlify/vue-i18n/blob/master/spec/syntax.ebnf), [\`Intl.MessageFormat\` (MF2)](https://github.com/tc39/proposal-intl-messageformat), and etc. This adapter will support localization with your preferred message format. |
| [TranslationAdapterFactoryOptions](interfaces/TranslationAdapterFactoryOptions.md) | Translation adapter factory options. |

## Type Aliases

| Type Alias | Description |
| ------ | ------ |
| [CommandResource](type-aliases/CommandResource.md) | Command resource type for i18n plugin. |
| [CommandResourceFetcher](type-aliases/CommandResourceFetcher.md) | Command resource fetcher. |
| [PluginId](type-aliases/PluginId.md) | Type representing the unique identifier for i18n plugin. |
| [TranslationAdapterFactory](type-aliases/TranslationAdapterFactory.md) | Translation adapter factory. |
