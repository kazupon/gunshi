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
cli <command> [command options]
```

For example:

```
cli create --name my-resource
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
  name: 'manage',
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

## Type-Safe Sub-Commands

When working with sub-commands, you can maintain type safety:

```ts
import { cli } from 'gunshi'
import type { ArgOptions, Command } from 'gunshi'

// Define type-safe sub-commands
const createCommand: Command<ArgOptions> = {
  name: 'create',
  options: {
    name: { type: 'string', short: 'n' }
  },
  run: ctx => {
    console.log(`Creating: ${ctx.values.name}`)
  }
}

const listCommand: Command<ArgOptions> = {
  name: 'list',
  run: () => {
    console.log('Listing items...')
  }
}

// Create a Map of sub-commands
const subCommands = new Map<string, Command<ArgOptions>>()
subCommands.set('create', createCommand)
subCommands.set('list', listCommand)

// Define the main command
const mainCommand: Command<ArgOptions> = {
  name: 'app',
  run: () => {
    console.log('Use a sub-command: create, list')
  }
}

// Execute with type-safe sub-commands
cli(process.argv.slice(2), mainCommand, {
  subCommands
})
```
