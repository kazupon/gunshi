# Lazy & Async Command Loading

Gunshi supports lazy loading of commands and asynchronous execution, which can significantly improve the performance and responsiveness of your CLI applications, especially when dealing with many commands or resource-intensive operations.

## Why Use Lazy Loading?

Lazy loading is beneficial when:

- Your CLI has many commands, but users typically only use a few at a time
- Some commands require heavy dependencies that aren't needed for other commands
- You want to reduce the initial startup time of your CLI

## Basic Lazy Loading

Here's how to implement lazy loading in Gunshi:

```js
import { cli } from 'gunshi'

// Define a command that will be loaded lazily
const lazyCommand = async () => {
  console.log('Loading lazy command...')

  // You could import heavy dependencies here
  // const heavyDependency = await import('heavy-dependency')

  // Return the actual command
  return {
    name: 'lazy',
    description: 'A command that is loaded lazily',
    run: ctx => {
      console.log('Lazy command executed!')
    }
  }
}

// Create a Map of sub-commands with lazy-loaded commands
const subCommands = new Map()
subCommands.set('lazy', lazyCommand)

// Define the main command
const mainCommand = {
  name: 'lazy-example',
  description: 'Example of lazy loading',
  run: () => {
    console.log('Use the lazy sub-command')
  }
}

// Run the CLI with lazy-loaded commands
cli(process.argv.slice(2), mainCommand, {
  name: 'my-app',
  version: '1.0.0',
  subCommands
})
```

In this example, the `lazyCommand` is a function that returns a Promise that resolves to the actual command. The command is only loaded when the user runs the corresponding sub-command.

## Async Command Execution

Gunshi also supports asynchronous command execution, which is useful for commands that need to perform asynchronous operations:

```js
import { cli } from 'gunshi'

const command = {
  name: 'async-example',
  description: 'Example of async command execution',
  options: {
    delay: {
      type: 'number',
      default: 1000
    }
  },
  usage: {
    options: {
      delay: 'Delay in milliseconds'
    }
  },
  run: async ctx => {
    const { delay } = ctx.values

    console.log(`Waiting for ${delay}ms...`)

    // Perform an async operation
    await new Promise(resolve => setTimeout(resolve, delay))

    console.log('Async operation completed!')
  }
}

cli(process.argv.slice(2), command)
```

## Combining Lazy Loading and Async Execution

You can combine lazy loading and async execution for maximum flexibility:

```js
import { cli } from 'gunshi'

// Define a command that will be loaded lazily
const lazyCommand = async () => {
  console.log('Loading lazy command...')

  // Simulate a delay to demonstrate async loading
  await new Promise(resolve => setTimeout(resolve, 1000))

  console.log('Lazy command loaded!')

  // Return the actual command with async execution
  return {
    name: 'lazy',
    description: 'A command that is loaded lazily',
    options: {
      delay: {
        type: 'number',
        short: 'd',
        default: 500
      }
    },
    usage: {
      options: {
        delay: 'Delay in milliseconds for command execution'
      }
    },
    run: async ctx => {
      const { delay } = ctx.values

      console.log(`Executing lazy command with ${delay}ms delay...`)

      // Simulate async work
      await new Promise(resolve => setTimeout(resolve, delay))

      console.log('Lazy command execution completed!')
    }
  }
}

// Create a Map of sub-commands with lazy-loaded commands
const subCommands = new Map()
subCommands.set('lazy', lazyCommand)

// Run the CLI with lazy-loaded commands
cli(
  process.argv.slice(2),
  { name: 'main', run: () => {} },
  {
    name: 'lazy-async-example',
    version: '1.0.0',
    subCommands
  }
)
```

## Loading Data Asynchronously

A common use case for lazy loading and async execution is fetching data from external sources:

```js
import { cli } from 'gunshi'

// Define a command that loads data asynchronously
const dataCommand = async () => {
  console.log('Loading data command...')

  // Simulate fetching data from an API
  const fetchData = async () => {
    console.log('Fetching data...')
    await new Promise(resolve => setTimeout(resolve, 800))
    return [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 3, name: 'Item 3' }
    ]
  }

  // Fetch the data asynchronously
  const data = await fetchData()

  console.log('Data command loaded with data!')

  // Return the command with the fetched data
  return {
    name: 'data',
    description: 'A command that loads data asynchronously',
    options: {
      id: {
        type: 'number',
        short: 'i'
      }
    },
    usage: {
      options: {
        id: 'Filter by item ID'
      }
    },
    run: ctx => {
      const { id } = ctx.values

      console.log('Available data:')

      if (id) {
        const item = data.find(item => item.id === id)
        if (item) {
          console.log(`- ${item.id}: ${item.name}`)
        } else {
          console.log(`No item found with ID: ${id}`)
        }
      } else {
        for (const item of data) {
          console.log(`- ${item.id}: ${item.name}`)
        }
      }
    }
  }
}

// Create a Map of sub-commands
const subCommands = new Map()
subCommands.set('data', dataCommand)

// Run the CLI
cli(
  process.argv.slice(2),
  { name: 'main', run: () => {} },
  {
    name: 'data-example',
    version: '1.0.0',
    subCommands
  }
)
```

In this example, the data is fetched asynchronously when the command is loaded, and then made available to the command's `run` function.

## Type-Safe Async Commands

For async commands, you can use TypeScript's async/await with proper typing:

```ts
import { cli } from 'gunshi'
import type { ArgOptions, Command, CommandContext } from 'gunshi'

// Define a type-safe async command
const command: Command<ArgOptions> = {
  name: 'async-example',
  options: {
    delay: {
      type: 'number',
      default: 1000
    }
  },
  run: async (ctx: CommandContext<ArgOptions>) => {
    const { delay } = ctx.values

    console.log(`Waiting for ${delay}ms...`)
    await new Promise(resolve => setTimeout(resolve, delay as number))
    console.log('Done!')
  }
}

// Execute the async command
cli(process.argv.slice(2), command)
```

## Performance Benefits

Lazy loading and async execution can provide significant performance benefits:

1. **Faster startup time**: Only load the commands that are actually used
2. **Reduced memory usage**: Avoid loading unnecessary dependencies
3. **Better responsiveness**: Perform heavy operations asynchronously without blocking the main thread
4. **Improved user experience**: Provide feedback during long-running operations
