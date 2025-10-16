import i18n, { defineI18nWithTypes, pluginId as i18nId, resolveKey } from '@gunshi/plugin-i18n'
import resources from '@gunshi/resources'
import { cli } from 'gunshi'

import type { I18nExtension } from '@gunshi/plugin-i18n'

const command = defineI18nWithTypes<{ extensions: { [i18nId]: I18nExtension } }>()({
  name: 'greeter',
  args: {
    name: { type: 'string', short: 'n' },
    formal: { type: 'boolean', short: 'f' }
  },

  // Load translations from files
  resource: async locale => {
    if (locale.toString() === 'ja-JP') {
      // Dynamic import for lazy loading
      const resource = await import('./locales/ja-JP.json', {
        with: { type: 'json' }
      })
      return resource.default
    }

    // Default to English
    const enUS = await import('./locales/en-US.json', {
      with: { type: 'json' }
    })
    return enUS.default
  },

  run: ctx => {
    const { name = 'World', formal } = ctx.values
    const t = ctx.extensions[i18nId].translate

    // Always use resolveKey for custom keys
    const greetingKey = formal
      ? resolveKey('formal_greeting', ctx.name)
      : resolveKey('informal_greeting', ctx.name)

    const greeting = t(greetingKey)
    console.log(`${greeting}, ${name}!`)
  }
})

await cli(process.argv.slice(2), command, {
  name: 'i18n-example',
  version: '1.0.0',
  plugins: [
    i18n({
      locale: process.env.MY_LANG || 'en-US',
      builtinResources: resources
    })
  ]
})
