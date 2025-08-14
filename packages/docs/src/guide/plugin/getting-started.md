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

await cli(process.argv.slide(2), entry, {
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

## Complete Example: Database Plugin

Here's a more realistic plugin that provides database functionality:

```ts
import { plugin } from 'gunshi/plugin'
import { Database } from './database' // Your database library

// Define what the plugin provides
interface DatabaseExtension {
  db: Database
  query: <T>(sql: string, params?: any[]) => Promise<T[]>
  transaction: <T>(fn: () => Promise<T>) => Promise<T>
}

// Export the plugin ID for type-safe access
export const pluginId = 'db' as const

// Create the plugin
export default function databasePlugin(config?: { connectionString?: string }) {
  return plugin<{}, typeof pluginId, [], DatabaseExtension>({
    id: pluginId,
    name: 'Database Plugin',

    // Add database-related global options
    setup: ctx => {
      ctx.addGlobalOption('dbUrl', {
        type: 'string',
        description: 'Database connection string',
        default: config?.connectionString
      })
    },

    // Provide database functionality
    extension: (ctx, cmd) => {
      const connectionString = ctx.values.dbUrl || 'sqlite::memory:'
      const db = new Database(connectionString)

      return {
        db,
        query: async (sql, params) => {
          console.log(`[DB] Executing: ${sql}`)
          return db.query(sql, params)
        },
        transaction: async fn => {
          return db.transaction(fn)
        }
      }
    },

    // Cleanup when extension is created
    onExtension: async (ctx, cmd) => {
      // This runs after the extension is created
      console.log('Database connected')

      // You could register cleanup handlers here
      process.on('exit', () => {
        ctx.extensions[pluginId].db.close()
      })
    }
  })
}

// Use the database plugin
const command = {
  name: 'migrate',
  run: async ctx => {
    const { db, query, transaction } = ctx.extensions.db

    await transaction(async () => {
      await query('CREATE TABLE IF NOT EXISTS users (id INT, name TEXT)')
      await query('INSERT INTO users VALUES (?, ?)', [1, 'Alice'])
    })

    const users = await query('SELECT * FROM users')
    console.log('Users:', users)
  }
}

await cli(args, command, {
  plugins: [
    databasePlugin({
      connectionString: 'postgresql://localhost/myapp'
    })
  ]
})
```

## Testing Your Plugin

### Running Your Plugin

Create a simple test CLI to verify your plugin works:

```ts
// test-plugin.ts
import { cli } from 'gunshi'
import myPlugin from './my-plugin'

const testCommand = {
  name: 'test',
  run: ctx => {
    console.log('Command context:', ctx)
    // Test your plugin's functionality here
  }
}

await cli(process.argv.slice(2), testCommand, {
  plugins: [myPlugin()]
})
```

Run it:

```bash
node test-plugin.js test --help
```

### Debugging Techniques

1. **Log in Setup Phase**:

```ts
setup: ctx => {
  console.log('Plugin loaded:', ctx)
  console.log('Available commands:', ctx.subCommands)
}
```

2. **Log in Extension Creation**:

```ts
extension: (ctx, cmd) => {
  console.log('Creating extension for:', cmd.name)
  console.log('Context values:', ctx.values)
  return {
    /* extension */
  }
}
```

3. **Use Debug Mode**:

```ts
setup: ctx => {
  const debug = process.env.DEBUG === 'true'
  if (debug) {
    console.log('Plugin context:', ctx)
  }
}
```

## TypeScript Support

For the best development experience, use TypeScript with proper type exports:

```ts
// my-plugin.ts
import { plugin } from 'gunshi/plugin'

// Export your extension interface
export interface MyExtension {
  doSomething: () => void
}

// Export your plugin ID as a const
export const pluginId = 'my-plugin' as const
export type PluginId = typeof pluginId

// Export a factory function
export default function myPlugin(options?: { verbose?: boolean }) {
  return plugin<{}, PluginId, [], MyExtension>({
    id: pluginId,
    name: 'My Plugin',
    extension: () => ({
      doSomething: () => {
        if (options?.verbose) {
          console.log('Doing something verbosely')
        }
      }
    })
  })
}
```

Commands can then use your plugin with full type safety:

```ts
import { define } from 'gunshi'
import type { MyExtension } from './my-plugin'

const command = define<MyExtension>({
  name: 'example',
  run: ctx => {
    // TypeScript knows about your extension!
    ctx.extensions.doSomething()
  }
})
```

## Next Steps

Now that you've created your first plugin:

1. Learn about the [Plugin Lifecycle](./lifecycle.md) to understand when plugins execute
2. Explore [Plugin Dependencies](./dependencies.md) for building complex plugin systems
3. Review [Best Practices](./best-practices.md) for production-ready plugins
4. Check out [Official Plugins](./official-plugins.md) for inspiration and examples
