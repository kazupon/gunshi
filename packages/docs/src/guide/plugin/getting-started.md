# Getting Started with Plugin Development

This guide will walk you through creating your first Gunshi plugin, from the simplest possible plugin to more advanced patterns with extensions and decorators.

## Your First Minimal Plugin

Let's start with the absolute minimum (no extension) - a plugin that simply logs when it's loaded:

```js [plugin.js]
import { plugin } from 'gunshi/plugin'

// The simplest possible plugin
export default plugin({
  id: 'hello',
  name: 'Hello Plugin',
  setup: ctx => {
    console.log('Hello from plugin!')
  }
})
```

Use it in your CLI:

```js [index.js]
import { cli } from 'gunshi'
import hello from './plugin.js'

const entry = () => {}

await cli(process.argv.slice(2), entry, {
  plugins: [hello]
})
```

Run your application with plugin:

```sh
# Run the entry with plugin
node index.js

Hello from plugin!
```

This plugin:

- Has a unique `id` for identification
- Has a human-readable `name`
- Runs its `setup` function during plugin initialization
- Doesn't extend the command context

## Adding Global Options

Let's create a plugin that adds a global `--debug` option to all commands:

```js [plugin.js]
import { plugin } from 'gunshi/plugin'

export default plugin({
  id: 'debug',
  name: 'Debug Plugin',

  setup: ctx => {
    // Add a global option available to all commands
    ctx.addGlobalOption('debug', {
      type: 'boolean',
      short: 'd',
      description: 'Enable debug output'
    })
  }
})
```

Now all commands have access to `--debug`:

```js [index.js]
import { cli } from 'gunshi'
import debug from './plugin.js'

const command = {
  name: 'build',
  run: ctx => {
    if (ctx.values.debug) {
      console.log('Debug mode enabled')
      console.log('Context:', ctx)
    }
    console.log('Building...')
  }
}

await cli(process.argv.slice(2), command, {
  plugins: [debug]
})
```

Run your application with plugin:

```sh
# Run command with debug option
node ./index.js --debug

Debug mode enabled
Context: ...
...
Building ...
```

## Adding Sub-Commands

Plugins can register sub-commands that become available to the CLI:

```js [plugin.js]
import { plugin } from 'gunshi/plugin'

export default plugin({
  id: 'tools',
  name: 'Developer Tools Plugin',

  setup: ctx => {
    // Add a new sub-command
    ctx.addCommand('clean', {
      name: 'clean',
      description: 'Clean build artifacts',
      args: {
        cache: {
          type: 'boolean',
          description: 'Also clear cache',
          default: false
        }
      },
      run: ctx => {
        console.log('Cleaning build artifacts...')
        if (ctx.values.cache) {
          console.log('Clearing cache...')
        }
        console.log('Clean complete!')
      }
    })

    // Add another sub-command
    ctx.addCommand('lint', {
      name: 'lint',
      description: 'Run linter',
      run: ctx => {
        console.log('Running linter...')
        console.log('No issues found!')
      }
    })
  }
})
```

Now your CLI has additional commands:

```js [index.js]
import { cli } from 'gunshi'
import tools from './plugin.js'

// Main command
const command = {
  name: 'build',
  run: ctx => console.log('Building project...')
}

await cli(process.argv.slice(2), command, {
  plugins: [tools]
})
```

Run your application with the new sub-commands:

```sh
# Run main command
node index.js
Building project...

# Run plugin's sub-command
node index.js clean
Cleaning build artifacts...
Clean complete!

# With arguments
node index.js clean --cache
Cleaning build artifacts...
Clearing cache...
Clean complete!

# Run another sub-command
node index.js lint
Running linter...
No issues found!
```

## Advanced Plugin Features

Beyond basic setup and global options, plugins can provide much more powerful functionality:

### Extensions

Plugins can extend the command context with new functionality that all commands can use.

```js
// Simple example - adding logging functionality
export default plugin({
  id: 'logger',
  extension: () => ({
    log: msg => console.log(msg)
  })
})

// Commands can then use: ctx.extensions.logger.log('Hello')
```

> [!TIP]
> Extensions are the core feature for sharing functionality between plugins and commands. Learn more in [Plugin Extensions](./extensions.md).

### Decorators

Plugins can decorate (wrap) existing functionality to enhance behavior:

```js
// Customize how help text is displayed
ctx.decorateUsageRenderer(async (baseRenderer, ctx) => {
  const baseUsage = await baseRenderer(ctx)
  return `${baseUsage}\n\n📚 Documentation: https://example.com/docs`
})
```

> [!TIP]
> Decorators allow you to wrap commands, renderers, and more. Learn about all decorator types in [Plugin Decorators](./decorators.md).

### Dependencies

Plugins can declare dependencies on other plugins:

```js
export default plugin({
  id: 'auth',
  dependencies: ['logger'], // Requires logger plugin
  setup: ctx => {
    // Logger plugin is guaranteed to be loaded
  }
})
```

> [!TIP]
> Dependencies ensure plugins load in the correct order. Learn more in [Plugin Dependencies](./dependencies.md).

## Summary

You've now learned the basics of Gunshi plugin development:

- Creating minimal plugins with setup functions
- Adding global options available to all commands
- Registering sub-commands through plugins
- Understanding advanced features (extensions, decorators, dependencies)

These fundamentals provide a solid foundation for building more complex plugins.

## Next Steps

Now that you've created your first plugin, continue with:

1. [Plugin Lifecycle](./lifecycle.md) - Understand when and how plugins execute
2. [Plugin Dependencies](./dependencies.md) - Build plugin ecosystems
3. [Plugin Decorators](./decorators.md) - Wrap and enhance functionality
4. [Plugin Extensions](./extensions.md) - Share functionality between plugins and commands
5. [Plugin List](./list.md) - Real-world examples and inspiration
