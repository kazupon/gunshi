# Advanced Plugin Development

This guide covers advanced plugin development patterns for complex real-world applications.

## Complete Example: Database Plugin

Here's a comprehensive plugin that provides database functionality with proper resource management:

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

## Advanced Testing Strategies

### Unit Testing Plugins

Test plugins in isolation with mocked dependencies:

```ts
import { describe, it, expect, vi } from 'vitest'
import databasePlugin from './database-plugin'

describe('DatabasePlugin', () => {
  it('should create extension with database connection', async () => {
    const mockDb = {
      query: vi.fn(),
      transaction: vi.fn(),
      close: vi.fn()
    }

    // Mock the Database constructor
    vi.mock('./database', () => ({
      Database: vi.fn(() => mockDb)
    }))

    const plugin = databasePlugin({ connectionString: 'test://db' })
    const extension = await plugin.extension?.(
      { values: { dbUrl: 'test://db' } } as any,
      { name: 'test' } as any
    )

    expect(extension).toHaveProperty('db')
    expect(extension).toHaveProperty('query')
    expect(extension).toHaveProperty('transaction')
  })
})
```

### Integration Testing

Test plugins with the full CLI lifecycle:

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

Run comprehensive tests:

```bash
# Test help display
node test-plugin.js test --help

# Test with various options
node test-plugin.js test --debug --verbose

# Test error handling
node test-plugin.js test --invalid-option
```

### Advanced Debugging Techniques

1. **Lifecycle Tracing**:

```ts
const debugPlugin = plugin({
  id: 'debug',

  setup: ctx => {
    console.log('[SETUP] Plugin loaded')
    console.log('[SETUP] Global options:', Array.from(ctx.globalOptions.keys()))
    console.log('[SETUP] Sub commands:', Array.from(ctx.subCommands.keys()))

    ctx.decorateCommand(baseRunner => async ctx => {
      console.log('[EXECUTE] Before command:', ctx.name)
      const result = await baseRunner(ctx)
      console.log('[EXECUTE] After command:', ctx.name)
      return result
    })
  },

  extension: (ctx, cmd) => {
    console.log('[EXTENSION] Creating for:', cmd.name)
    console.log('[EXTENSION] Context values:', ctx.values)
    return {}
  },

  onExtension: (ctx, cmd) => {
    console.log('[EXTENSION] Created for:', cmd.name)
    console.log('[EXTENSION] All extensions:', Object.keys(ctx.extensions))
  }
})
```

2. **Performance Profiling**:

```ts
const profilingPlugin = plugin({
  id: 'profiling',

  setup: ctx => {
    const timings = new Map<string, number>()

    ctx.decorateCommand(baseRunner => async ctx => {
      const key = `cmd:${ctx.name}`
      timings.set(key, performance.now())

      try {
        return await baseRunner(ctx)
      } finally {
        const duration = performance.now() - timings.get(key)!
        console.log(`Performance: ${ctx.name} took ${duration.toFixed(2)}ms`)
        timings.delete(key)
      }
    })
  }
})
```

3. **Memory Usage Tracking**:

```ts
const memoryPlugin = plugin({
  id: 'memory',

  setup: ctx => {
    ctx.decorateCommand(baseRunner => async ctx => {
      const before = process.memoryUsage()

      const result = await baseRunner(ctx)

      const after = process.memoryUsage()
      const diff = {
        rss: (after.rss - before.rss) / 1024 / 1024,
        heapUsed: (after.heapUsed - before.heapUsed) / 1024 / 1024
      }

      console.log(`Memory: RSS ${diff.rss.toFixed(2)}MB, Heap ${diff.heapUsed.toFixed(2)}MB`)

      return result
    })
  }
})
```

## Advanced TypeScript Patterns

### Generic Plugin Factory

Create reusable plugin factories with generic types:

```ts
// Create a generic service plugin factory
export function createServicePlugin<T, E extends Record<string, any>>(
  id: string,
  createService: (ctx: any) => T,
  createExtension: (service: T) => E
) {
  const pluginId = id as const

  return plugin<{}, typeof pluginId, [], E>({
    id: pluginId,

    extension: (ctx, cmd) => {
      const service = createService(ctx)
      return createExtension(service)
    },

    onExtension: async (ctx, cmd) => {
      // Generic cleanup
      process.on('exit', () => {
        const service = ctx.extensions[pluginId] as any
        if (service?.dispose) {
          service.dispose()
        }
      })
    }
  })
}

// Use the factory
const redisPlugin = createServicePlugin(
  'redis',
  ctx => new Redis(ctx.values.redisUrl),
  redis => ({
    get: key => redis.get(key),
    set: (key, value) => redis.set(key, value),
    delete: key => redis.del(key)
  })
)
```

### Type-Safe Plugin Composition

Compose multiple plugins with type safety:

```ts
// Define plugin interfaces
export interface LoggerExtension {
  log: (message: string) => void
}

export interface MetricsExtension {
  track: (event: string, data?: any) => void
}

export interface CacheExtension {
  get: <T>(key: string) => Promise<T | null>
  set: <T>(key: string, value: T) => Promise<void>
}

// Create a composed type
type AppExtensions = {
  logger: LoggerExtension
  metrics: MetricsExtension
  cache: CacheExtension
}

// Use in commands with full type safety
import { define } from 'gunshi'

const command = define<AppExtensions>({
  name: 'process',
  run: async ctx => {
    ctx.extensions.logger.log('Starting process')

    const cached = await ctx.extensions.cache.get('data')
    if (cached) {
      ctx.extensions.metrics.track('cache_hit')
      return cached
    }

    ctx.extensions.metrics.track('cache_miss')
    // Process data...
  }
})
```

### Conditional Type Extensions

Use conditional types for flexible plugin APIs:

```ts
type PluginConfig<T extends boolean = false> = {
  advanced?: T
}

type PluginExtension<T extends boolean> = T extends true
  ? {
      basic: () => void
      advanced: () => void
    }
  : {
      basic: () => void
    }

export function flexiblePlugin<T extends boolean = false>(config?: PluginConfig<T>) {
  return plugin<{}, 'flexible', [], PluginExtension<T>>({
    id: 'flexible',

    extension: () => {
      const base = { basic: () => console.log('Basic') }

      if (config?.advanced) {
        return {
          ...base,
          advanced: () => console.log('Advanced')
        } as PluginExtension<T>
      }

      return base as PluginExtension<T>
    }
  })
}

// Usage
const basicPlugin = flexiblePlugin() // Only has 'basic'
const advancedPlugin = flexiblePlugin({ advanced: true }) // Has both 'basic' and 'advanced'
```

## Inter-Plugin Data Sharing

### Shared State Pattern

Plugins can share state through their extensions:

```ts
// Session plugin provides shared state
const sessionPlugin = plugin({
  id: 'session',
  extension: () => {
    const state = new Map<string, any>()

    return {
      get: (key: string) => state.get(key),
      set: (key: string, value: any) => state.set(key, value),
      has: (key: string) => state.has(key),
      delete: (key: string) => state.delete(key)
    }
  }
})

// Auth plugin uses session
const authPlugin = plugin<{ session: SessionExtension }, 'auth', ['session']>({
  id: 'auth',
  dependencies: ['session'],

  extension: ctx => {
    const { session } = ctx.extensions

    return {
      login: async (username: string, password: string) => {
        const user = await authenticate(username, password)
        session.set('user', user)
        session.set('token', user.token)
        return user
      },

      logout: () => {
        session.delete('user')
        session.delete('token')
      },

      getUser: () => session.get('user'),
      getToken: () => session.get('token')
    }
  }
})
```

### Event Emitter Pattern

Create an event system for plugin communication:

```ts
export interface EventsExtension {
  on: (event: string, handler: Function) => void
  off: (event: string, handler: Function) => void
  emit: (event: string, ...args: any[]) => void
  once: (event: string, handler: Function) => void
}

const eventsPlugin = plugin({
  id: 'events',
  extension: (): EventsExtension => {
    const events = new Map<string, Set<Function>>()

    return {
      on: (event, handler) => {
        if (!events.has(event)) {
          events.set(event, new Set())
        }
        events.get(event)!.add(handler)
      },

      off: (event, handler) => {
        events.get(event)?.delete(handler)
      },

      emit: (event, ...args) => {
        const handlers = events.get(event)
        if (handlers) {
          for (const handler of handlers) {
            handler(...args)
          }
        }
      },

      once: (event, handler) => {
        const wrapper = (...args: any[]) => {
          handler(...args)
          events.get(event)?.delete(wrapper)
        }
        events.get(event)?.add(wrapper)
      }
    }
  }
})

// Other plugins can use events
const analyticsPlugin = plugin<{ events: EventsExtension }, 'analytics', ['events']>({
  id: 'analytics',
  dependencies: ['events'],

  onExtension: ctx => {
    const { events } = ctx.extensions

    // Listen for events from other plugins
    events.on('user:login', (user: User) => {
      trackEvent('login', { userId: user.id })
    })

    events.on('command:complete', (command: string, duration: number) => {
      trackEvent('command', { command, duration })
    })
  },

  extension: ctx => {
    const { events } = ctx.extensions

    return {
      track: (name: string, data: any) => {
        // Track event
        console.log(`[Analytics] ${name}:`, data)

        // Emit event for other plugins
        events.emit('analytics:track', name, data)
      }
    }
  }
})
```

## Advanced Extension Patterns

### Lazy Extension Initialization

Defer expensive operations until actually needed:

```ts
plugin({
  id: 'heavy',
  extension: () => {
    let initialized = false
    let heavyResource: HeavyResource

    const ensureInitialized = async () => {
      if (!initialized) {
        heavyResource = await createHeavyResource()
        initialized = true
      }
    }

    return {
      doWork: async () => {
        await ensureInitialized()
        return heavyResource.process()
      },

      // Getter for lazy access
      get resource() {
        if (!initialized) {
          throw new Error('Resource not initialized. Call doWork() first')
        }
        return heavyResource
      }
    }
  }
})
```

### Extension Composition

Combine multiple extensions into one:

```ts
// Compose multiple concerns into a single extension
plugin({
  id: 'composed',
  extension: ctx => {
    const logger = createLogger()
    const cache = createCache()
    const metrics = createMetrics()

    return {
      // Logger functionality
      log: logger.log,
      error: logger.error,

      // Cache functionality
      cache: {
        get: cache.get,
        set: cache.set
      },

      // Metrics functionality
      metrics: {
        increment: metrics.increment,
        gauge: metrics.gauge
      }
    }
  }
})
```

### Dynamic Extension Properties

Create extensions with dynamic properties:

```ts
plugin({
  id: 'config',
  extension: () => {
    const config = loadConfig()

    // Create dynamic getters for config values
    return new Proxy(
      {},
      {
        get: (target, prop: string) => {
          if (prop in config) {
            return config[prop]
          }
          throw new Error(`Unknown config key: ${prop}`)
        }
      }
    )
  }
})
```

## Resource Management

### Connection Pooling

Implement connection pooling for better resource utilization:

```ts
class ConnectionPool<T> {
  private connections: T[] = []
  private available: T[] = []
  private waiting: ((conn: T) => void)[] = []

  constructor(
    private factory: () => Promise<T>,
    private options = { min: 2, max: 10 }
  ) {
    this.initialize()
  }

  async acquire(): Promise<T> {
    if (this.available.length > 0) {
      return this.available.pop()!
    }

    if (this.connections.length < this.options.max) {
      const conn = await this.factory()
      this.connections.push(conn)
      return conn
    }

    return new Promise(resolve => {
      this.waiting.push(resolve)
    })
  }

  release(conn: T): void {
    const waiter = this.waiting.shift()
    if (waiter) {
      waiter(conn)
    } else {
      this.available.push(conn)
    }
  }
}

const pooledDbPlugin = plugin({
  id: 'pooled-db',

  extension: () => {
    const pool = new ConnectionPool(() => Database.connect(), { min: 5, max: 20 })

    return {
      query: async (sql: string) => {
        const conn = await pool.acquire()
        try {
          return await conn.query(sql)
        } finally {
          pool.release(conn)
        }
      }
    }
  }
})
```

### Cleanup and Disposal

Properly clean up resources:

```ts
const resourcePlugin = plugin({
  id: 'resource',

  extension: () => {
    const resources: Array<{ dispose: () => void }> = []

    const cleanup = () => {
      resources.forEach(r => r.dispose())
      resources.length = 0
    }

    // Register cleanup handlers
    process.once('exit', cleanup)
    process.once('SIGINT', cleanup)
    process.once('SIGTERM', cleanup)

    return {
      createResource: () => {
        const resource = new Resource()
        resources.push(resource)
        return resource
      },
      cleanup
    }
  }
})
```

## Next Steps

- Review [Guidelines](./guidelines.md) for production guidelines
- Explore [Plugin Dependencies](./dependencies.md) for complex systems
- Study [Plugin List](./list.md) for real-world examples
- Learn about [Plugin Lifecycle](./lifecycle.md) for timing considerations
