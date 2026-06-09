# API Documentation

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
| [DEFAULT_LOCALE](/packages/plugin-i18n/docs/default/variables/DEFAULT_LOCALE.md) | The default locale string, which format is BCP 47 language tag. |
| [pluginId](/packages/plugin-i18n/docs/default/variables/pluginId.md) | The unique identifier for the i18n plugin. |

## Functions

| Function | Description |
| ------ | ------ |
| [createTranslationAdapter](/packages/plugin-i18n/docs/default/functions/createTranslationAdapter.md) | Create a translation adapter. |
| [default](/packages/plugin-i18n/docs/default/functions/default.md) | i18n plugin |
| [defineI18n](/packages/plugin-i18n/docs/default/functions/defineI18n.md) | Define an i18n-aware [command](/packages/plugin-i18n/docs/default/interfaces/I18nCommand.md). |
| [defineI18nWithTypes](/packages/plugin-i18n/docs/default/functions/defineI18nWithTypes.md) | Define an i18n-aware [command](/packages/plugin-i18n/docs/default/interfaces/I18nCommand.md) with types |
| [resolveArgKey](/packages/plugin-i18n/docs/default/functions/resolveArgKey.md) | Resolve a namespaced key for argument resources. |
| [resolveBuiltInKey](/packages/plugin-i18n/docs/default/functions/resolveBuiltInKey.md) | Resolve a namespaced key for built-in resources. |
| [resolveKey](/packages/plugin-i18n/docs/default/functions/resolveKey.md) | Resolve a namespaced key for non-built-in resources. |
| [withI18nResource](/packages/plugin-i18n/docs/default/functions/withI18nResource.md) | Add i18n resource to an existing command |

## Classes

| Class | Description |
| ------ | ------ |
| [DefaultTranslation](/packages/plugin-i18n/docs/default/classes/DefaultTranslation.md) | Default implementation of [`TranslationAdapter`](/packages/plugin-i18n/docs/default/interfaces/TranslationAdapter.md). |

## Interfaces

| Interface | Description |
| ------ | ------ |
| [I18nCommand](/packages/plugin-i18n/docs/default/interfaces/I18nCommand.md) | I18n-aware command interface that extends the base Command with resource support |
| [I18nExtension](/packages/plugin-i18n/docs/default/interfaces/I18nExtension.md) | Extended command context which provides utilities via i18n plugin. These utilities are available via `CommandContext.extensions['g:i18n']`. |
| [I18nPluginOptions](/packages/plugin-i18n/docs/default/interfaces/I18nPluginOptions.md) | i18n plugin options |
| [TranslationAdapter](/packages/plugin-i18n/docs/default/interfaces/TranslationAdapter.md) | Translation adapter. |
| [TranslationAdapterFactoryOptions](/packages/plugin-i18n/docs/default/interfaces/TranslationAdapterFactoryOptions.md) | Translation adapter factory options. |

## Type Aliases

| Type Alias | Description |
| ------ | ------ |
| [CommandResource](/packages/plugin-i18n/docs/default/type-aliases/CommandResource.md) | Command resource type for i18n plugin. |
| [CommandResourceFetcher](/packages/plugin-i18n/docs/default/type-aliases/CommandResourceFetcher.md) | Command resource fetcher. |
| [PluginId](/packages/plugin-i18n/docs/default/type-aliases/PluginId.md) | Type representing the unique identifier for i18n plugin. |
| [TranslationAdapterFactory](/packages/plugin-i18n/docs/default/type-aliases/TranslationAdapterFactory.md) | Translation adapter factory. |

