# Command Hooks

Gunshi provides powerful lifecycle hooks that allow you to intercept and control command execution at various stages. These hooks enable advanced scenarios like logging, monitoring, validation, and error handling.

## Understanding Command Lifecycle

The command execution lifecycle in Gunshi follows these stages:

```mermaid
graph TD
    Start([Start]) --> A[User Input]
    A --> B[Parse Arguments]
    B --> C[Apply Plugins]
    C --> D[Resolve Command]
    D --> E[Resolve Arguments]
    E --> F[Create Command Context]
    F --> G[onBeforeCommand Hook]
    G --> H{Success?}
    H -->|Yes| I[Execute Command]
    H -->|Error| K[onErrorCommand Hook]
    I --> J{Success?}
    J -->|Yes| L[onAfterCommand Hook]
    J -->|Error| K
    L --> M{Success?}
    M -->|Yes| N[Return Result]
    M -->|Error| K
    K --> O[Throw Error]
    N --> P([End])
    O --> P

    style G fill:#468c56,color:#000000
    style L fill:#468c56,color:#000000
    style K fill:#468c56,color:#000000
```

## Available Hooks

Gunshi provides three main lifecycle hooks:

- **`onBeforeCommand`**: Executes before the command runs
- **`onAfterCommand`**: Executes after successful command completion
- **`onErrorCommand`**: Executes when a command throws an error

## Basic Hook Usage

### Setting Up Hooks

Hooks are configured at the CLI level in the options:

```ts
import { cli } from 'gunshi'

await cli(
  process.argv.slice(2),
  {
    name: 'server',
    run: ctx => {
      console.log('Starting server...')
    }
  },
  {
    name: 'my-app',
    version: '1.0.0',

    // Define lifecycle hooks
    onBeforeCommand: async ctx => {
      console.log(`About to run: ${ctx.name}`)
    },

    onAfterCommand: async (ctx, result) => {
      console.log(`Command ${ctx.name} completed successfully`)
    },

    onErrorCommand: async (ctx, error) => {
      console.error(`Command ${ctx.name} failed:`, error)
    }
  }
)
```

### Hook Parameters

Each hook receives different parameters:

```ts
{
  // Before command execution
  onBeforeCommand?: (ctx: Readonly<CommandContext>) => Awaitable<void>

  // After successful execution
  onAfterCommand?: (ctx: Readonly<CommandContext>, result: string | undefined) => Awaitable<void>

  // On command error
  onErrorCommand?: (ctx: Readonly<CommandContext>, error: Error) => Awaitable<void>
}
```

## Use cases

### Logging and Monitoring

Implement comprehensive logging across all commands:

```ts
import { cli } from 'gunshi'
import logger, { pluginId as loggerId } from '@my/plugin-logger'

await cli(process.argv.slice(2), commands, {
  name: 'my-app',

  // Install logger plugin
  plugins: [logger()],

  onBeforeCommand: ctx => {
    const logger = ctx.extensions[loggerId]
    // Log command start with arguments
    logger?.info('Command started', {
      command: ctx.name,
      args: ctx.values,
      timestamp: new Date().toISOString()
    })
  },

  onAfterCommand: (ctx, result) => {
    const logger = ctx.extensions[loggerId]
    // Log successful completion
    logger?.info('Command completed', {
      command: ctx.name,
      duration: Date.now() - logger?.startTime,
      result: typeof result
    })
  },

  onErrorCommand: (ctx, error) => {
    const logger = ctx.extensions[loggerId]
    // Log errors with full context
    logger?.error('Command failed', {
      command: ctx.name,
      error: error.message,
      stack: error.stack,
      args: ctx.values
    })
  }
})
```

### Performance Monitoring

Track command execution times and performance metrics:

```ts
import { cli } from 'gunshi'
import metrics, { pluginId as metricsId } from '@my/plugin-metrics'

await cli(process.argv.slice(2), commands, {
  name: 'my-app',

  // Install metrics plugin
  plugins: [metrics()],

  onBeforeCommand: ctx => {
    const metrics = ctx.extensions[metricsId]
    // Start tracking command execution
    metrics?.startTracking({
      command: ctx.name,
      args: ctx.values,
      environment: process.env.NODE_ENV
    })
  },

  onAfterCommand: async (ctx, result) => {
    const metrics = ctx.extensions[metricsId]
    // Record successful completion
    const duration = metrics?.endTracking()

    // Send metrics to monitoring service
    await metrics?.send({
      command: ctx.name,
      status: 'success',
      duration,
      memoryUsage: process.memoryUsage(),
      resultSize: result?.length || 0
    })
  },

  onErrorCommand: async (ctx, error) => {
    const metrics = ctx.extensions[metricsId]
    // Record failure metrics
    const duration = metrics?.endTracking()

    // Send error metrics with additional context
    await metrics?.send({
      command: ctx.name,
      status: 'failed',
      duration,
      error: error.message,
      errorType: error.constructor.name,
      stackTrace: error.stack
    })
  }
})
```

### Validation and Guards

Use hooks to implement global validation or access control:

```ts
import { cli } from 'gunshi'
import auth, { pluginId as authId } from '@my/plugin-auth'

await cli(process.argv.slice(2), commands, {
  name: 'my-app',

  // Install auth plugin
  plugins: [
    auth({
      publicCommands: ['help', 'version', 'login'],
      tokenSource: ['env:AUTH_TOKEN', 'args:token']
    })
  ],

  onBeforeCommand: async ctx => {
    const auth = ctx.extensions[authId]

    // Skip auth for public commands
    if (auth?.isPublicCommand(ctx.name)) {
      return
    }

    // Verify authentication
    const token = auth?.getToken()
    if (!token) {
      throw new Error('Authentication required. Please run "login" first.')
    }

    const user = await auth?.verifyToken(token)
    if (!user) {
      throw new Error('Invalid or expired token. Please login again.')
    }

    // Store user info for command use
    await auth?.setCurrentUser(user)
  },

  onAfterCommand: async ctx => {
    const auth = ctx.extensions[authId]
    // Clean up sensitive data after command execution
    await auth?.clearSession()
  },

  onErrorCommand: async (ctx, error) => {
    const auth = ctx.extensions[authId]
    // Log security-related errors
    if (error.message.includes('Authentication') || error.message.includes('token')) {
      await auth?.logSecurityEvent({
        type: 'auth_failure',
        command: ctx.name,
        timestamp: new Date().toISOString()
      })
    }
  }
})
```

### Transaction Management

Implement database transactions or rollback mechanisms:

```ts
import { cli } from 'gunshi'
import database, { pluginId as dbId } from '@my/plugin-database'

await cli(process.argv.slice(2), commands, {
  name: 'my-app',

  // Install database plugin with transaction support
  plugins: [
    database({
      connectionString: process.env.DATABASE_URL,
      transactionalCommands: ['create', 'update', 'delete', 'migrate']
    })
  ],

  onBeforeCommand: async ctx => {
    const db = ctx.extensions[dbId]

    // Start transaction for data-modifying commands
    if (db?.isTransactionalCommand(ctx.name)) {
      const transaction = await db.beginTransaction()

      // Store transaction ID for tracking
      await db?.setCurrentTransaction(transaction.id)

      console.log(`Transaction ${transaction.id} started for command: ${ctx.name}`)
    }
  },

  onAfterCommand: async (ctx, result) => {
    const db = ctx.extensions[dbId]
    const transaction = db?.getCurrentTransaction()

    if (transaction) {
      // Commit on success
      await db.commit(transaction.id)
      console.log(`Transaction ${transaction.id} committed successfully`)

      // Clean up transaction reference
      await db.clearCurrentTransaction()
    }
  },

  onErrorCommand: async (ctx, error) => {
    const db = ctx.extensions[dbId]
    const transaction = db?.getCurrentTransaction()

    if (transaction) {
      // Rollback on error
      await db?.rollback(transaction.id)
      console.error(`Transaction ${transaction.id} rolled back due to error:`, error.message)

      // Log the failed transaction for audit
      await db?.logTransactionFailure({
        id: transaction.id,
        command: ctx.name,
        error: error.message,
        timestamp: new Date().toISOString()
      })

      // Clean up transaction reference
      await db?.clearCurrentTransaction()
    }
  }
})
```

## Hook Execution Order

### CLI Hooks vs Plugin Decorators

Gunshi provides two distinct mechanisms for controlling command execution:

1. **CLI-level Hooks**: Observation and control points that run **before and after** command execution
   - `onBeforeCommand`: Pre-execution processing (logging, validation, initialization)
   - `onAfterCommand`: Post-success processing (cleanup, metrics recording)
   - `onErrorCommand`: Error handling (error logging, rollback)

2. **Plugin Decorators**: **Wrap** the command itself to modify its behavior
   - `decorateCommand`: Wraps command runner to add or modify functionality
   - Multiple plugins can chain decorators (decorator pattern)

### Execution Flow

```mermaid
graph TD
    A[onBeforeCommand Hook] --> B{Success?}
    B -->|Yes| C[Plugin Decorators Chain]
    B -->|Error| G[onErrorCommand Hook]

    C --> D[Decorated Command Runner]
    D --> E{Success?}

    E -->|Yes| F[onAfterCommand Hook]
    E -->|Error| G

    F --> H{Success?}
    H -->|Yes| I[Return Result]
    H -->|Error| G

    G --> J[Throw Error]

    style A fill:#468c56,color:#000000
    style F fill:#468c56,color:#000000
    style G fill:#468c56,color:#000000
    style C fill:#7EA6E0,color:#000000
    style D fill:#7EA6E0,color:#000000
```

### Detailed Execution Sequence

1. **`onBeforeCommand` Hook** - Pre-execution setup and validation
2. **Plugin Decorator Chain** - Command wrapping by plugins
   - Applied in reverse order (LIFO - last registered, first executed)
   - Each decorator wraps the next runner in the chain
3. **Command Runner** - Actual command execution
4. **`onAfterCommand` Hook** - Post-success processing
5. **`onErrorCommand` Hook** - Error handling when exceptions occur

### Plugin Decorator Example

```ts
// Using decorateCommand in a plugin
export default plugin({
  id: 'timing-plugin',
  setup: ctx => {
    // Wrap command execution to measure execution time
    ctx.decorateCommand(baseRunner => {
      return async commandCtx => {
        const start = Date.now()
        try {
          const result = await baseRunner(commandCtx)
          console.log(`Execution time: ${Date.now() - start}ms`)
          return result
        } catch (error) {
          console.log(`Failed after: ${Date.now() - start}ms`)
          throw error
        }
      }
    })
  }
})
```

> [!NOTE]
> Plugins don't have CLI-level hooks (`onBeforeCommand`, etc.). Instead, they use the `decorateCommand` method to wrap command execution and add custom logic. This allows plugins to extend and modify command behavior through the decorator pattern.

## Next Steps

- Explore [Rendering Customization](./rendering-customization.md) for UI control
- Learn about [Type System](./type-system.md) for type-safe hooks
- See [Plugin Lifecycle](/guide/plugin/lifecycle.md) for plugin-specific hooks
