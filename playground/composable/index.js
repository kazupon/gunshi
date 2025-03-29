import { cli } from 'gunshi'

// Composable sub-commands example
// This demonstrates how to create a CLI with composable sub-commands

// Define the 'create' sub-command
const createCommand = {
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
  examples: '# Create a resource\n$ node index.js create --name my-resource --type special',
  run: ctx => {
    const { name, type } = ctx.values
    console.log(`Creating ${type} resource: ${name}`)
  }
}

// Define the 'list' sub-command
const listCommand = {
  name: 'list',
  description: 'List all resources',
  options: {
    type: {
      type: 'string',
      short: 't',
      description: 'Filter by resource type'
    },
    limit: {
      type: 'number',
      short: 'l',
      default: 10,
      description: 'Maximum number of resources to list (default: 10)'
    }
  },
  examples: '# List resources\n$ node index.js list\n$ node index.js list --type special --limit 5',
  run: ctx => {
    const { type, limit } = ctx.values
    console.log(`Listing ${limit} resources${type ? ` of type ${type}` : ''}`)

    // Simulate listing resources
    for (let i = 1; i <= limit; i++) {
      console.log(`  ${i}. Resource-${i}${type ? ` (${type})` : ''}`)
    }
  }
}

// Define the 'delete' sub-command
const deleteCommand = {
  name: 'delete',
  description: 'Delete a resource',
  options: {
    name: {
      type: 'string',
      short: 'n',
      required: true,
      description: 'Name of the resource to delete (required)'
    },
    force: {
      type: 'boolean',
      short: 'f',
      description: 'Force deletion without confirmation'
    }
  },
  examples:
    '# Delete a resource\n$ node index.js delete --name my-resource\n$ node index.js delete -n my-resource -f',
  run: ctx => {
    const { name, force } = ctx.values
    if (force) {
      console.log(`Forcefully deleting resource: ${name}`)
    } else {
      console.log(`Deleting resource: ${name} (use --force to skip confirmation)`)
    }
  }
}

// Create a Map of sub-commands
const subCommands = new Map()
subCommands.set('create', createCommand)
subCommands.set('list', listCommand)
subCommands.set('delete', deleteCommand)

// Define the main command
const mainCommand = {
  name: 'resource-manager',
  description: 'Manage resources with composable sub-commands',
  // The main command can have its own options
  options: {
    verbose: {
      type: 'boolean',
      short: 'v',
      description: 'Enable verbose output'
    }
  },
  examples:
    '# Use sub-commands\n$ node index.js create --name my-resource\n$ node index.js list\n$ node index.js delete --name my-resource',
  // This run function is executed when no sub-command is specified
  run: ctx => {
    const { verbose } = ctx.values

    console.log('Resource Manager CLI')
    console.log('-------------------')
    console.log('Use one of the following sub-commands:')
    console.log('  create - Create a new resource')
    console.log('  list   - List all resources')
    console.log('  delete - Delete a resource')
    console.log('\nRun with --help for more information')

    if (verbose) {
      console.log('\nVerbose mode enabled')
      console.log('Available sub-commands:', [...subCommands.keys()])
    }
  }
}

// Run the CLI with composable sub-commands
await cli(process.argv.slice(2), mainCommand, {
  name: 'resource-manager',
  version: '1.0.0',
  description: 'Example of composable sub-commands',
  subCommands
})
