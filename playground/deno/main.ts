import { cli, define } from '@kazupon/gunshi'
import enUS from './locales/en-US.json' with { type: 'json' }

// Note: Removed 'import type { ArgOptions, Command }...' as define handles types

if (import.meta.main) {
  // Define the 'create' subcommand using define
  const createCommand = define({
    name: 'create',
    description: enUS.description,
    args: {
      name: {
        type: 'string',
        short: 'n',
        description: 'Name of the resource'
      },
      type: {
        type: 'string',
        short: 't',
        default: 'default',
        description: 'Type of resource (default: "default")'
      }
    },
    resource: async ctx => {
      // Locale loading logic remains the same
      if (ctx.locale.toString() === 'ja-JP') {
        const resource = await import('./locales/ja-JP.json', {
          with: { type: 'json' }
        })
        return resource.default
      }
      return enUS
    },
    run: ctx => {
      // Types for name (string | undefined) and type (string) are inferred
      console.log(`Creating ${ctx.values.type} resource: ${ctx.values.name}`)
    }
  })

  // Prepare sub commands map
  const subCommands = new Map()
  subCommands.set(createCommand.name, createCommand)

  // Define the main command using define
  const mainCommand = define({
    name: 'main',
    description: 'A CLI application with Deno',
    args: {
      count: {
        type: 'number',
        short: 'c',
        description: 'A count number'
      }
    },
    run: ctx => {
      // Type for count (number | undefined) is inferred
      console.log(`Count: ${ctx.values.count}`)
    }
  })

  // Run CLI
  await cli(
    Deno.args, // Pass Deno arguments directly
    mainCommand, // Pass the defined main command
    {
      // CLI Metadata
      name: 'deno-cli-app',
      version: '0.1.0',
      locale: navigator.language, // Locale detection remains
      subCommands // Pass the defined subcommands
    }
  )
}
