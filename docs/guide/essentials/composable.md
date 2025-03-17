# Composable Sub-commands

Gunshi makes it easy to create CLIs with multiple sub-commands, allowing you to build complex command-line applications with a modular structure. This approach is similar to tools like Git, where commands like `git commit` and `git push` are sub-commands of the main `git` command.

## Why Use Sub-commands?

Sub-commands are useful when your CLI needs to perform different operations that warrant separate commands. Benefits include:

- **Organization**: Group related functionality logically
- **Scalability**: Add new commands without modifying existing ones
- **User experience**: Provide a consistent interface for different operations
- **Help system**: Each sub-command can have its own help documentation

## Basic Structure

A CLI with sub-commands typically has this structure:

```
my-cli [global options] <command> [command options]
```

For example:

```
my-cli --verbose create --name my-resource
```

## Creating Sub-commands

Here's how to create a CLI with sub-commands in Gunshi:

```js
import { cli } from 'gunshi'

// Define sub-commands
const createCommand = {
  name: 'create',
  description: 'Create a new resource',
  options: {
    name: { type: 'string', short: 'n' }
  },
  run: ctx => {
    console.log(`Creating resource: ${ctx.values.name}`)
  }
}

const listCommand = {
  name: 'list',
  description: 'List all resources',
  run: () => {
    console.log('Listing all resources...')
  }
}

// Create a Map of sub-commands
const subCommands = new Map()
subCommands.set('create', createCommand)
subCommands.set('list', listCommand)

// Define the main command
const mainCommand = {
  name: 'resource-manager',
  description: 'Manage resources',
  run: () => {
    console.log('Use one of the sub-commands: create, list')
  }
}

// Run the CLI with composable sub-commands
cli(process.argv.slice(2), mainCommand, {
  name: 'my-app',
  version: '1.0.0',
  subCommands
})
```

## Default Sub-command

You can specify a default sub-command that runs when no sub-command is explicitly provided:

```js
const listCommand = {
  name: 'list',
  description: 'List all resources',
  default: true, // This makes it the default command
  run: () => {
    console.log('Listing all resources...')
  }
}
```

## Global Options

Options defined in the main command are available to all sub-commands:

```js
const mainCommand = {
  name: 'resource-manager',
  description: 'Manage resources',
  options: {
    verbose: {
      type: 'boolean',
      short: 'v',
      description: 'Enable verbose output'
    }
  },
  run: ctx => {
    console.log('Use one of the sub-commands: create, list')

    if (ctx.values.verbose) {
      console.log('Verbose mode enabled')
    }
  }
}
```

In sub-commands, you can access global options through the context:

```js
const createCommand = {
  name: 'create',
  description: 'Create a new resource',
  options: {
    name: { type: 'string', short: 'n' }
  },
  run: ctx => {
    console.log(`Creating resource: ${ctx.values.name}`)

    // Access global verbose option
    if (ctx.values.verbose) {
      console.log('Verbose mode enabled in create command')
    }
  }
}
```

## Nested Sub-commands

You can create nested sub-commands for even more complex CLIs:

```js
// First level sub-command
const resourceCommand = {
  name: 'resource',
  description: 'Manage resources'
}

// Second level sub-commands
const createResourceCommand = {
  name: 'create',
  description: 'Create a new resource',
  run: () => {
    console.log('Creating resource...')
  }
}

const listResourceCommand = {
  name: 'list',
  description: 'List resources',
  run: () => {
    console.log('Listing resources...')
  }
}

// Create nested sub-commands
const resourceSubCommands = new Map()
resourceSubCommands.set('create', createResourceCommand)
resourceSubCommands.set('list', listResourceCommand)

// Add sub-commands to the resource command
const subCommands = new Map()
subCommands.set('resource', {
  ...resourceCommand,
  subCommands: resourceSubCommands
})

// Define the main command
const mainCommand = {
  name: 'my-app',
  description: 'My application',
  run: () => {
    console.log('Use a sub-command')
  }
}

// Run the CLI with nested sub-commands
cli(process.argv.slice(2), mainCommand, {
  name: 'my-app',
  version: '1.0.0',
  subCommands
})
```

With this setup, users can run commands like:

```
my-app resource create
my-app resource list
```

## Complete Example

Here's a complete example of a CLI with sub-commands:

```js
import { cli } from 'gunshi'

// Define the 'create' sub-command
const createCommand = {
  name: 'create',
  description: 'Create a new resource',
  options: {
    name: {
      type: 'string',
      short: 'n',
      required: true
    },
    type: {
      type: 'string',
      short: 't',
      default: 'default'
    }
  },
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
      short: 't'
    },
    limit: {
      type: 'number',
      short: 'l',
      default: 10
    }
  },
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
      required: true
    },
    force: {
      type: 'boolean',
      short: 'f'
    }
  },
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
  options: {
    verbose: {
      type: 'boolean',
      short: 'v'
    }
  },
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
cli(process.argv.slice(2), mainCommand, {
  name: 'resource-manager',
  version: '1.0.0',
  description: 'Example of composable sub-commands',
  subCommands
})
```

## Next Steps

Now that you understand how to create composable sub-commands, you can:

- [Implement lazy loading](/guide/essentials/lazy-async) for better performance with many sub-commands
- [Add auto usage generation](/guide/essentials/auto-usage-generation) for better help documentation
- [Explore internationalization](/guide/essentials/internationalization) for multi-language support
