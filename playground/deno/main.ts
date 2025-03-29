import { cli } from '@kazupon/gunshi'
import enUS from './locales/en-US.json' with { type: 'json' }

import type { ArgOptions } from '@kazupon/gunshi'

if (import.meta.main) {
  // define options
  const options = {
    name: {
      type: 'string',
      short: 'n'
    },
    type: {
      type: 'string',
      short: 't',
      default: 'default'
    }
  } satisfies ArgOptions

  // define create sub command
  const create = {
    name: 'create',
    description: enUS.description,
    options,
    resource: async ctx => {
      if (ctx.locale.toString() === 'ja-JP') {
        const resource = await import('./locales/ja-JP.json', { with: { type: 'json' } })
        return resource.default
      }
      return enUS
    },
    run: ctx => {
      console.log(`Creating ${ctx.values.type} resource: ${ctx.values.name}`)
    }
  }

  // prepare sub commands map
  const subCommands = new Map()
  subCommands.set(create.name, create)

  // run CLI
  await cli(
    Deno.args,
    {
      name: 'main',
      description: 'A CLI application with Deno',
      options: {
        count: {
          type: 'number',
          short: 'c'
        }
      },
      run: ctx => {
        console.log(`Count: ${ctx.values.count}`)
      }
    },
    {
      name: 'deno-cli-app',
      version: '0.1.0',
      locale: navigator.language,
      subCommands
    }
  )
}
