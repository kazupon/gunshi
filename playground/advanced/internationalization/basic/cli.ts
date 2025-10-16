import i18n, { defineI18nWithTypes, pluginId as i18nId, resolveKey } from '@gunshi/plugin-i18n'
import resources from '@gunshi/resources'
import { cli } from 'gunshi'

import type { I18nExtension } from '@gunshi/plugin-i18n'

// Define a command with i18n support
const command = defineI18nWithTypes<{ extensions: { [i18nId]: I18nExtension } }>()({
  name: 'greeter',
  args: {
    name: {
      type: 'string',
      short: 'n',
      description: 'Name to greet'
    },
    formal: {
      type: 'boolean',
      short: 'f',
      description: 'Use formal greeting'
    }
  },

  // Define translation resources for the command
  resource: locale => {
    if (locale.toString() === 'ja-JP') {
      return {
        description: '挨拶アプリケーション',
        'arg:name': '挨拶する相手の名前',
        'arg:formal': '丁寧な挨拶を使用する',
        informal_greeting: 'こんにちは',
        formal_greeting: 'はじめまして'
      }
    }

    // Default to English
    return {
      description: 'Greeting application',
      'arg:name': 'Name to greet',
      'arg:formal': 'Use formal greeting',
      informal_greeting: 'Hello',
      formal_greeting: 'Good day'
    }
  },

  // Command execution function
  run: ctx => {
    const { name = 'World', formal } = ctx.values
    const t = ctx.extensions[i18nId].translate

    // Use resolveKey for custom keys with proper namespacing
    const greetingKey = formal
      ? resolveKey('formal_greeting', ctx.name)
      : resolveKey('informal_greeting', ctx.name)

    const greeting = t(greetingKey)
    console.log(`${greeting}, ${name}!`)

    // Show translation information
    const locale = ctx.extensions[i18nId].locale
    console.log(`\nCurrent locale: ${locale}`)

    // Use resolveKey for description as well
    const descKey = resolveKey('description', ctx.name)
    console.log(`Command Description: ${t(descKey)}`)
  }
})

// Run the command with i18n plugin
await cli(process.argv.slice(2), command, {
  name: 'i18n-example',
  version: '1.0.0',
  plugins: [
    i18n({
      // Set locale from environment or default to en-US
      locale: process.env.MY_LANG || 'en-US',
      // Provide built-in translations for common terms.
      // See the support locales: https://github.com/kazupon/gunshi/tree/main/packages/resources#-supported-locales
      builtinResources: resources
    })
  ]
})
