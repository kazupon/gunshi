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

```js [cli.js]
import { cli } from 'gunshi'
import hello from './plugin.js'

const entry = () => {}

await cli(process.argv.slice(2), entry, {
  plugins: [hello]
})
```

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!TIP]
> The example fully code is [here](https://github.com/kazupon/gunshi/tree/main/playground/plugins/getting-started/first-minimal).

<!-- eslint-enable markdown/no-missing-label-refs -->

Run your application with plugin:

```sh
# Run the entry with plugin
node cli.js

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

```js [cli.js]
import { cli, define } from 'gunshi'
import debug from './plugin.js'

const command = define({
  name: 'build',
  run: ctx => {
    if (ctx.values.debug) {
      console.log('Debug mode enabled')
      console.log('Context:', ctx)
    }
    console.log('Building...')
  }
})

await cli(process.argv.slice(2), command, {
  plugins: [debug]
})
```

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!TIP]
> The example fully code is [here](https://github.com/kazupon/gunshi/tree/main/playground/plugins/getting-started/adding-global).

<!-- eslint-enable markdown/no-missing-label-refs -->

Run your application with plugin:

```sh
# Run command with debug option
node cli.js --debug

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

```js [cli.js]
import { cli, define } from 'gunshi'
import tools from './plugin.js'

// Main command
const command = define({
  name: 'build',
  run: ctx => console.log('Building project...')
})

await cli(process.argv.slice(2), command, {
  plugins: [tools]
})
```

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!TIP]
> The example fully code is [here](https://github.com/kazupon/gunshi/tree/main/playground/plugins/getting-started/adding-sub-commands).

<!-- eslint-enable markdown/no-missing-label-refs -->

Run your application with the new sub-commands:

```sh
# Run main command
node cli.js
Building project...

# Run plugin's sub-command
node cli.js clean
Cleaning build artifacts...
Clean complete!

# With arguments
node cli.js clean --cache
Cleaning build artifacts...
Clearing cache...
Clean complete!

# Run another sub-command
node cli.js lint
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

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!TIP]
> Extensions are the core feature for sharing functionality between plugins and commands. Learn more in [Plugin Extensions](./extensions.md).

<!-- eslint-enable markdown/no-missing-label-refs -->

### Decorators

Plugins can decorate (wrap) existing functionality to enhance behavior:

```js
// Customize how help text is displayed
ctx.decorateUsageRenderer(async (baseRenderer, ctx) => {
  const baseUsage = await baseRenderer(ctx)
  return `${baseUsage}\n\n📚 Documentation: https://example.com/docs`
})
```

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!TIP]
> Decorators allow you to wrap commands, renderers, and more. Learn about all decorator types in [Plugin Decorators](./decorators.md).

<!-- eslint-enable markdown/no-missing-label-refs -->

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

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!TIP]
> Dependencies ensure plugins load in the correct order. Learn more in [Plugin Dependencies](./dependencies.md).

<!-- eslint-enable markdown/no-missing-label-refs -->

## Summary

You've now learned the basics of Gunshi plugin development:

- Creating minimal plugins with setup functions
- Adding global options available to all commands
- Registering sub-commands through plugins
- Understanding advanced features (extensions, decorators, dependencies)

These fundamentals provide a solid foundation for building more complex plugins.

## Next Steps

You've created your first Gunshi plugin and learned the fundamental concepts: setup functions, global options, sub-command registration, and basic plugin features.

With these foundations in place, you're ready to understand how plugins integrate with the CLI execution flow.

The next chapter, [Plugin Lifecycle](./lifecycle.md), will show you exactly when and how plugins execute during CLI runtime, giving you the knowledge to build more sophisticated plugins that interact with commands at the right moments.
