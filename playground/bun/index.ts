import type { ArgOptions, Command } from 'gunshi'

import { cli } from 'gunshi'

if (import.meta.main) {
  const options = {
    name: {
      type: 'string',
      short: 'n',
      description: 'Name of the resource to create'
    },
    type: {
      type: 'string',
      short: 't',
      default: 'default',
      description: 'Type of resource to create (default: "default")'
    }
  } satisfies ArgOptions

  const create = {
    name: 'create',
    description: 'Create a new resource',
    options,
    examples: '# Create a resource\n$ bun index.ts create --name my-resource --type special',
    run: ctx => {
      console.log(`Creating ${ctx.values.type} resource: ${ctx.values.name}`)
    }
  } satisfies Command<typeof options>

  const subCommands = new Map()
  subCommands.set(create.name, create)

  await cli(
    Bun.argv.slice(2),
    {
      name: 'main',
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
      name: 'bun-cli-app',
      version: '0.1.0',
      subCommands
    }
  )
}
