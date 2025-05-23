import { cli } from 'gunshi'
import enUS from './locales/en-US.json' with { type: 'json' }

// Internationalization (i18n) example
// This demonstrates how to use the i18n features of gunshi

// Define a command with internationalization support
const command = {
  name: 'greeter',

  args: {
    name: {
      type: 'string',
      short: 'n'
    },
    formal: {
      type: 'boolean',
      short: 'f'
    }
  },

  // Define a resource fetcher for translations
  resource: async ctx => {
    // This function is called when the command is executed
    // It should return translations based on the current locale

    console.log(`Loading resources for locale: ${ctx.locale}`)

    // Check the locale and return appropriate translations
    if (ctx.locale.toString() === 'ja-JP') {
      const resource = await import('./locales/ja-JP.json', { with: { type: 'json' } })
      return resource.default
    }

    // Default to English
    return enUS
  },

  // Command execution function
  run: ctx => {
    const { name = 'World', formal } = ctx.values
    const locale = ctx.locale.toString()

    console.log(`Current locale: ${locale}`)

    // Choose between formal and informal greeting
    // const greeting = formal ? localeGreetings.formal : localeGreetings.informal
    const greeting = formal ? ctx.translate('formal_greeting') : ctx.translate('informal_greeting')

    // Display the greeting
    console.log(`${greeting}, ${name}!`)

    // Show translation information
    console.log('\ntranslation information:')
    console.log(`command description: ${ctx.translate('description')}`)
    console.log(`name argument: ${ctx.translate('name')}`)
    console.log(`formal option: ${ctx.translate('formal')}`)
  }
}

async function main() {
  // Run the command with i18n support
  await cli(process.argv.slice(2), command, {
    name: 'i18n-example',
    version: '1.0.0',
    description: 'Example of internationalization support',
    // Set the locale via an environment variable
    // If Node v21 or later is used, you can use the built-in `navigator.language` instead)
    locale: new Intl.Locale(process.env.MY_LOCALE || 'en-US')
  })

  // Note: Run this example with different locales to see the translations
  // $ node index.js --help
  // $ MY_LOCALE=ja-JP node index.js --help
  // $ node index.js --name John
  // $ MY_LOCALE=ja-JP node index.js --name 田中 --formal
}

// eslint-disable-next-line unicorn/prefer-top-level-await
main().catch(error => {
  console.error(error)
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1)
})
