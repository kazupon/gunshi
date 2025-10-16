import { cli, define } from 'gunshi'

// Define type-safe sub-commands
const createCommand = define({
  name: 'create',
  description: 'Create a new resource',
  args: {
    name: { type: 'string', short: 'n', required: true }
  },
  run: ctx => {
    // ctx.values is fully typed
    console.log(`Creating resource: ${ctx.values.name}`)
  }
})

const listCommand = define({
  name: 'list',
  description: 'List all resources',
  run: () => {
    console.log('Listing all resources...')
  }
})

// Define the main command
const mainCommand = define({
  name: 'manage',
  description: 'Manage resources',
  run: ctx => {
    // This runs when no sub-command is provided
    console.log('Available commands: create, list')
    console.log('Run "manage --help" for more information')
  }
})

// Run the CLI with composable sub-commands
await cli(process.argv.slice(2), mainCommand, {
  name: 'my-app',
  version: '1.0.0',
  subCommands: {
    create: createCommand,
    list: listCommand
  }
})
