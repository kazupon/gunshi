import { cli, define } from 'gunshi'

if (import.meta.main) {
  // Define the 'create' subcommand using define
  const createCommand = define({
    name: 'create',
    description: 'Create a new resource',
    options: {
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
    },
    examples: '# Create a resource\n$ bun index.ts create --name my-resource --type special',
    run: ctx => {
      // Types for name (string | undefined) and type (string) are inferred
      console.log(`Creating ${ctx.values.type} resource: ${ctx.values.name}`)
    }
  })

  const subCommands = new Map()
  subCommands.set(createCommand.name, createCommand)

  // Define the main command using define
  const mainCommand = define({
    name: 'main', // This name is internal if subcommands are used
    options: {
      count: {
        type: 'number',
        short: 'c'
      }
    },
    run: ctx => {
      // Type for count (number | undefined) is inferred
      console.log(`Count: ${ctx.values.count}`)
    }
  })

  // Execute the CLI
  await cli(
    Bun.argv.slice(2), // Pass Bun arguments
    mainCommand, // Pass the defined main command
    {
      // CLI metadata
      name: 'bun-cli-app',
      version: '0.1.0',
      subCommands // Pass the map of defined subcommands
    }
  )
}
