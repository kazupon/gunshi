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
node ./index.js --debug

Debug mode enabled
Context: ...
...
Building ...
```

## Plugin with Extension

Extensions allow plugins to provide functionality that commands can use:

```ts [logger.js]
import { plugin } from 'gunshi/plugin'

// Create a logger plugin
export default plugin({
  id: 'logger',
  name: 'Logger Plugin',

  // The extension factory returns the functionality
  extension: (ctx, cmd) => {
    const prefix = `[${cmd.name || 'CLI'}]`

    return {
      log: message => {
        console.log(`${prefix} ${message}`)
      },
      error: message => {
        console.error(`${prefix} ERROR: ${message}`)
      },
      debug: message => {
        if (ctx.values.debug) {
          console.log(`${prefix} DEBUG: ${message}`)
        }
      }
    }
  }
})
```

Use the extension in your command:

```ts [index.js]
import { cli } from 'gunshi'
import debug from './debug.js' // prepare previous your plugin
import logger from './logger.js'

const command = {
  name: 'deploy',
  run: ctx => {
    ctx.extensions.logger.log('Starting deployment')
    ctx.extensions.logger.debug('Checking environment')

    try {
      // Deployment logic
      ctx.extensions.logger.log('Deployment successful')
    } catch (error) {
      ctx.extensions.logger.error('Deployment failed')
    }
  }
}

await cli(process.argv.slice(2), command, {
  // install plugins
  plugins: [debug, logger]
})
```

Run your application with plugin:

```sh
node index.js
[deploy] Starting deployment
[deploy] Deployment successful

node index.js --debug
[deploy] Starting deployment
[deploy] DEBUG: Checking environment
[deploy] Deployment successful
```

## Decorating Renderers

Plugins can enhance how usage and help text is rendered:

```js [plugin.js]
import { plugin } from 'gunshi/plugin'

export default plugin({
  id: 'branding',
  name: 'Branding Plugin',

  setup: ctx => {
    // Decorate the header renderer
    ctx.decorateHeaderRenderer(async (baseRenderer, ctx) => {
      const baseHeader = await baseRenderer(ctx)
      return `
╔══════════════════════════════╗
║     My Awesome CLI v1.0      ║
╚══════════════════════════════╝

${baseHeader}
      `.trim()
    })

    // Decorate the usage renderer
    ctx.decorateUsageRenderer(async (baseRenderer, ctx) => {
      const baseUsage = await baseRenderer(ctx)
      return `${baseUsage}

📚 Documentation: https://example.com/docs
🐛 Report bugs: https://example.com/issues`
    })
  }
})
```

```js [index.js]
import { cli } from 'gunshi'
import branding from './plugin.js'

await cli(process.argv.slice(2), () => {}, {
  plugins: [branding]
})
```

Run your application with plugin:

```sh
node index.js --help
╔══════════════════════════════╗
║     My Awesome CLI v1.0      ║
╚══════════════════════════════╝

USAGE:
  COMMAND <OPTIONS>

OPTIONS:
  -h, --help             Display this help message
  -v, --version          Display this version


📚 Documentation: https://example.com/docs
🐛 Report bugs: https://example.com/issues
```

## Command Decorators

Decorate command execution to add pre/post processing:

```js [plugin.js]
import { plugin } from 'gunshi/plugin'

export default plugin({
  id: 'timing',
  name: 'Timing Plugin',

  setup: ctx => {
    ctx.decorateCommand(baseRunner => async ctx => {
      const start = Date.now()

      console.log(`⏱️ Starting ${ctx.name}...`)

      try {
        const result = await baseRunner(ctx)
        const duration = Date.now() - start
        console.log(`✅ Completed in ${duration}ms`)
        return result
      } catch (error) {
        const duration = Date.now() - start
        console.log(`❌ Failed after ${duration}ms`)
        throw error
      }
    })
  }
})
```

```js [index.js]
import { cli } from 'gunshi'
import timing from './plugin.js'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

await cli(
  process.argv.slice(2),
  {
    name: 'entry',
    run: async () => {
      await sleep(1000)
    }
  },
  {
    plugins: [timing]
  }
)
```

Run your application with plugin:

```sh
node index.js
⏱️ Starting entry...
✅ Completed in 1007ms
```

## Summary

You've now learned the basics of Gunshi plugin development:

- Creating minimal plugins with setup functions
- Adding global options available to all commands
- Building plugins with extensions to provide functionality
- Decorating renderers for custom output
- Wrapping command execution with decorators

These fundamentals provide a solid foundation for building more complex plugins.

## Next Steps

Now that you've created your first plugin:

1. Learn about the [Plugin Lifecycle](./lifecycle.md) to understand when plugins execute
2. Explore [Advanced Plugin Development](./advanced.md) for complex patterns and real-world examples
3. Understand [Plugin Dependencies](./dependencies.md) for building plugin ecosystems
4. Review [Best Practices](./best-practices.md) for production-ready plugins
5. Check out [Official Plugins](./official-plugins.md) for inspiration and examples
