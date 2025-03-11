import { cli } from 'gunshi'

// Internationalization (i18n) example
// This demonstrates how to use the i18n features of gunshi

// Define a command with internationalization support
const command = {
  name: 'greeter',
  description: 'A greeting application with internationalization support',

  options: {
    name: {
      type: 'string',
      short: 'n',
      description: 'Name to greet'
    },
    formal: {
      type: 'boolean',
      short: 'f',
      description: 'Use formal greeting'
    },
    locale: {
      type: 'string',
      short: 'l',
      description: 'Locale to use (en-US, ja-JP)'
    }
  },

  // Define usage information (will be translated)
  usage: {
    options: {
      name: 'Name to greet',
      formal: 'Use formal greeting',
      locale: 'Locale to use (en-US, ja-JP)'
    },
    examples:
      '# Basic greeting\n$ node index.js --name John\n\n# Formal greeting in Japanese\n$ node index.js --name 田中 --formal --locale ja-JP'
  },

  // Define a resource fetcher for translations
  resource: async ctx => {
    // This function is called when the command is executed
    // It should return translations based on the current locale

    console.log(`Loading resources for locale: ${ctx.locale}`)

    // Check the locale and return appropriate translations
    if (ctx.locale.toString() === 'ja-JP') {
      return {
        // Command description
        description: '国際化対応の挨拶アプリケーション',
        // Option descriptions
        options: {
          name: '挨拶する相手の名前',
          formal: '丁寧な挨拶を使用する',
          locale: '使用するロケール (en-US, ja-JP)'
        },
        // Examples
        examples:
          '# 基本的な挨拶\n$ node index.js --name 田中\n\n# 日本語での丁寧な挨拶\n$ node index.js --name 田中 --formal --locale ja-JP'
      }
    }

    // Default to English
    return {
      description: 'A greeting application with internationalization support',
      options: {
        name: 'Name to greet',
        formal: 'Use formal greeting',
        locale: 'Locale to use (en-US, ja-JP)'
      },
      examples:
        '# Basic greeting\n$ node index.js --name John\n\n# Formal greeting in Japanese\n$ node index.js --name 田中 --formal --locale ja-JP'
    }
  },

  // Command execution function
  run: ctx => {
    const { name = 'World', formal } = ctx.values
    const locale = ctx.locale.toString()

    console.log(`Current locale: ${locale}`)

    // Greetings in different languages
    const greetings = {
      'en-US': {
        informal: 'Hello',
        formal: 'Good day'
      },
      'ja-JP': {
        informal: 'こんにちは',
        formal: 'はじめまして'
      }
    }

    // Default to English if the locale is not supported
    const localeGreetings = greetings[locale] || greetings['en-US']

    // Choose between formal and informal greeting
    const greeting = formal ? localeGreetings.formal : localeGreetings.informal

    // Display the greeting
    console.log(`${greeting}, ${name}!`)

    // Show translation information
    console.log('\nTranslation Information:')
    console.log(`Command Description: ${ctx.translation('description')}`)
    console.log(`Name Option: ${ctx.translation('name')}`)
    console.log(`Formal Option: ${ctx.translation('formal')}`)
  }
}

// Create a locale option for the CLI
const localeOption = {
  locale: {
    type: 'string',
    description: 'Locale to use (en-US, ja-JP)'
  }
}

// Run the command with i18n support
cli(process.argv.slice(2), command, {
  name: 'i18n-example',
  version: '1.0.0',
  description: 'Example of internationalization support',
  // Add the locale option to the CLI options
  ...localeOption
})

// Note: Run this example with different locales to see the translations
// $ node index.js --help
// $ node index.js --help --locale ja-JP
// $ node index.js --name John
// $ node index.js --name 田中 --formal --locale ja-JP
