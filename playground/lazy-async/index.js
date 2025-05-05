import { cli, lazy } from 'gunshi'

// Lazy & Async command loading example
// This demonstrates how to use lazy loading and async execution of commands

console.log('Starting lazy-async playground CLI...')

// --- Lazy Command ---

// 1. Define the metadata (definition)
const lazyCommandDefinition = {
  name: 'lazy', // Key for subCommands map
  description: 'A command whose runner is loaded lazily',
  args: {
    delay: {
      type: 'number',
      short: 'd',
      default: 500,
      description: 'Delay in milliseconds for command execution (default: 500)'
    }
  },
  examples: '# Run the lazy command\n$ node index.js lazy\n$ node index.js lazy --delay 2000'
  // No 'run' here
}

// 2. Define the loader function (returns the CommandRunner)
const lazyCommandLoader = async () => {
  console.log('Loading lazy command runner...')
  // Simulate a delay to demonstrate async loading
  await new Promise(resolve => setTimeout(resolve, 1000))
  console.log('Lazy command runner loaded!')

  // Return the actual CommandRunner (run function)
  return async ctx => {
    const { delay } = ctx.values
    console.log(`Executing lazy command runner with ${delay}ms delay...`)
    // Simulate async work
    await new Promise(resolve => setTimeout(resolve, delay))
    console.log('Lazy command execution completed!')
    console.log('Command context values:', ctx.values)
  }
}

// 3. Create the LazyCommand using the helper
const lazyCommand = lazy(lazyCommandLoader, lazyCommandDefinition)

// --- Async Data Command ---

// 1. Define the metadata (definition)
const asyncDataDefinition = {
  name: 'data', // Key for subCommands map
  description: 'A command that loads data asynchronously via its loader',
  args: {
    id: {
      type: 'number',
      short: 'i',
      description: 'Filter by item ID'
    }
  },
  examples: '# Show data\n$ node index.js data\n$ node index.js data --id 2'
  // No 'run' here
}

// 2. Define the loader function (fetches data and returns CommandRunner)
const asyncDataLoader = async () => {
  console.log('Loading async data command runner...')

  // Simulate fetching data from an API during loading
  const fetchData = async () => {
    console.log('Fetching data for data command...')
    await new Promise(resolve => setTimeout(resolve, 800))
    return [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 3, name: 'Item 3' }
    ]
  }

  // Fetch the data asynchronously when the loader runs
  const data = await fetchData()
  console.log('Async data command runner loaded with data!')

  // Return the CommandRunner, which now has access to the fetched data via closure
  return ctx => {
    const { id } = ctx.values
    console.log('Available data (provided by loader):')
    if (id) {
      const item = data.find(item => item.id === id)
      if (item) {
        console.log(`- ${item.id}: ${item.name}`)
      } else {
        console.log(`No item found with ID: ${id}`)
      }
    } else {
      data.forEach(item => console.log(`- ${item.id}: ${item.name}`))
    }
  }
}

// 3. Create the LazyCommand using the helper
const asyncDataCommand = lazy(asyncDataLoader, asyncDataDefinition)

// --- CLI Setup ---

// Create a Map of sub-commands using the definition names as keys
const subCommands = new Map()
subCommands.set('lazy', lazyCommand)
subCommands.set('data', asyncDataCommand)

// Define the main command (doesn't need a complex run function anymore)
const mainCommand = {
  // name is optional if 'name' is provided in config
  description: 'Root command for the lazy-async example.',
  run: () => {
    // This runs if no sub-command is provided or if help is requested for the root
    console.log('Lazy & Async Command Example - Use --help to see commands.')
    // Gunshi will automatically generate the usage based on subCommands metadata
  }
}

// Run the CLI with lazy-loaded commands
// Gunshi automatically handles LazyCommand objects in subCommands
await cli(process.argv.slice(2), mainCommand, {
  name: 'lazy-async-example', // Application name
  version: '1.0.0',
  description: 'Example CLI demonstrating lazy loading and async features.',
  subCommands
})

console.log('CLI setup complete. Waiting for command execution...')
