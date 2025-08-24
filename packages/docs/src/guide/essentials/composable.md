# Composable Sub-commands

Gunshi makes it easy to create CLIs with multiple sub-commands, allowing you to build complex command-line applications with a modular structure. This approach is similar to tools like Git, where commands like `git commit` and `git push` are sub-commands of the main `git` command.

## Why Use Sub-commands?

Sub-commands are useful when your CLI needs to perform different operations that warrant separate commands. Benefits include:

- **Organization**: Group related functionality logically
- **Scalability**: Add new commands without modifying existing ones
- **User experience**: Provide a consistent interface for different operations
- **Help system**: Each sub-command can have its own help documentation
- **Plugin integration**: Plugins are shared across all sub-commands for consistent functionality

## Basic Structure

A CLI with sub-commands typically has this structure:

```sh
cli <command> [command options]
```

For example:

```sh
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
  args: {
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
await cli(process.argv.slice(2), mainCommand, {
  name: 'my-app',
  version: '1.0.0',
  subCommands
})
```

## Type-Safe Sub-commands

When working with sub-commands, you can maintain type safety:

```ts
import { cli, define } from 'gunshi'
import type { Command } from 'gunshi'

// Define type-safe sub-commands using define()
const createCommand = define({
  name: 'create',
  args: {
    name: { type: 'string', short: 'n', required: true }
  },
  run: ctx => {
    // ctx.values is fully typed
    console.log(`Creating: ${ctx.values.name}`)
  }
})

const listCommand = define({
  name: 'list',
  args: {
    verbose: { type: 'boolean', short: 'v' }
  },
  run: ctx => {
    if (ctx.values.verbose) {
      console.log('Listing items with details...')
    } else {
      console.log('Listing items...')
    }
  }
})

// Create a Map of sub-commands
const subCommands = new Map<string, Command>()
subCommands.set('create', createCommand)
subCommands.set('list', listCommand)

// Define the main command
const mainCommand = define({
  name: 'app',
  run: () => {
    console.log('Use a sub-command: create, list')
  }
})

// Execute with type-safe sub-commands
await cli(process.argv.slice(2), mainCommand, {
  name: 'my-app',
  version: '1.0.0',
  subCommands
})
```

## Sub-commands with Object Syntax

In addition to using a Map, you can define sub-commands as a plain object:

```js
import { cli, define } from 'gunshi'

const createCommand = define({
  name: 'create',
  description: 'Create a resource',
  run: ctx => console.log('Creating...')
})

const deleteCommand = define({
  name: 'delete',
  description: 'Delete a resource',
  run: ctx => console.log('Deleting...')
})

const mainCommand = define({
  name: 'manager',
  run: () => console.log('Use a sub-command')
})

// Use object syntax instead of Map
await cli(process.argv.slice(2), mainCommand, {
  name: 'my-cli',
  version: '1.0.0',
  subCommands: {
    create: createCommand,
    delete: deleteCommand
  }
})
```

## Sub-commands with Plugins

When you add plugins to your CLI configuration, they automatically enhance all sub-commands. Each sub-command has access to plugin extensions through the command context:

```js
import { cli, define } from 'gunshi'
import i18n, { pluginId as i18nId, resolveKey } from '@gunshi/plugin-i18n'

// Sub-commands can access plugin extensions
const createCommand = define({
  name: 'create',
  resource: async ctx => ({
    description: 'Create a resource',
    success: 'Created successfully!'
  }),
  run: ctx => {
    // Access i18n plugin if available
    const translate = ctx.extensions[i18nId]?.translate
    if (translate) {
      const successKey = resolveKey('success', ctx.name)
      console.log(translate(successKey))
    }
  }
})

const mainCommand = define({
  name: 'manager',
  run: () => console.log('Use a sub-command')
})

// Plugins are configured once at the top level
await cli(process.argv.slice(2), mainCommand, {
  name: 'my-cli',
  version: '1.0.0',
  subCommands: {
    create: createCommand
  },
  plugins: [i18n({ locale: 'en-US' })]
})
```

Plugins provide consistent functionality across all sub-commands without requiring individual configuration. For detailed plugin usage, see the [Plugin Ecosystem](./plugin-ecosystem.md) guide.

## Organized Command Structure

For better maintainability, organize sub-commands in separate files:

```js
// commands/create.js
import { define } from 'gunshi'

export const createCommand = define({
  name: 'create',
  description: 'Create a new resource',
  args: {
    name: { type: 'string', required: true }
  },
  run: ctx => {
    console.log(`Creating: ${ctx.values.name}`)
  }
})

// commands/list.js
import { define } from 'gunshi'

export const listCommand = define({
  name: 'list',
  description: 'List all resources',
  args: {
    filter: { type: 'string' }
  },
  run: ctx => {
    console.log('Listing resources...')
    if (ctx.values.filter) {
      console.log(`Filter: ${ctx.values.filter}`)
    }
  }
})

// main.js
import { cli } from 'gunshi'
import { createCommand } from './commands/create.js'
import { listCommand } from './commands/list.js'

const mainCommand = {
  name: 'resource-manager',
  run: () => {
    console.log('Use a sub-command')
  }
}

await cli(process.argv.slice(2), mainCommand, {
  name: 'resource-cli',
  version: '1.0.0',
  subCommands: {
    create: createCommand,
    list: listCommand
  }
})
```

## Fallback to Entry Command

Enable fallback behavior when an unknown sub-command is provided:

```js
await cli(process.argv.slice(2), mainCommand, {
  name: 'my-app',
  version: '1.0.0',
  fallbackToEntry: true, // Enable fallback
  subCommands: {
    create: createCommand,
    list: listCommand
  }
})

// Now these work:
// $ my-app create        # Runs create sub-command
// $ my-app list          # Runs list sub-command
// $ my-app unknown       # Falls back to main command
// $ my-app              # Runs main command
```

This feature is useful when you want your main command to handle arguments that don't match any sub-command, providing a more flexible user experience.

## Next Steps

- Learn about the [Plugin Ecosystem](./plugin-ecosystem.md) to enhance your sub-commands
- Explore [Context Extensions](./context-extensions.md) for plugin functionality
- Check out [Internationalization](./internationalization.md) for multi-language support
- See [Lazy Loading](./lazy-async.md) for optimizing sub-command loading
- Review [Auto Usage Generation](./auto-usage-generation.md) for automatic help text
