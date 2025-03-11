import { cli } from 'gunshi'

// Lazy & Async command loading example
// This demonstrates how to use lazy loading and async execution of commands

console.log('Starting CLI application...')

// Define a command that will be loaded lazily
const lazyCommand = async () => {
  console.log('Loading lazy command...')

  // Simulate a delay to demonstrate async loading
  await new Promise(resolve => setTimeout(resolve, 1000))

  console.log('Lazy command loaded!')

  // Return the actual command
  return {
    name: 'lazy',
    description: 'A command that is loaded lazily',
    options: {
      delay: {
        type: 'number',
        short: 'd',
        default: 500,
        description: 'Delay in milliseconds for command execution'
      }
    },
    usage: {
      options: {
        delay: 'Delay in milliseconds for command execution (default: 500)'
      },
      examples: '# Run the lazy command\n$ node index.js lazy\n$ node index.js lazy --delay 2000'
    },
    run: async ctx => {
      const { delay } = ctx.values

      console.log(`Executing lazy command with ${delay}ms delay...`)

      // Simulate async work
      await new Promise(resolve => setTimeout(resolve, delay))

      console.log('Lazy command execution completed!')
      console.log('Command context:', {
        name: ctx.name,
        description: ctx.description,
        values: ctx.values
      })
    }
  }
}

// Define another lazy command that depends on an async operation
const asyncDataCommand = async () => {
  console.log('Loading async data command...')

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

  console.log('Async data command loaded with data!')

  // Return the command with the fetched data
  return {
    name: 'data',
    description: 'A command that loads data asynchronously',
    options: {
      id: {
        type: 'number',
        short: 'i',
        description: 'Filter by item ID'
      }
    },
    usage: {
      options: {
        id: 'Filter by item ID'
      },
      examples: '# Show data\n$ node index.js data\n$ node index.js data --id 2'
    },
    // The command has access to the pre-fetched data
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

// Create a Map of sub-commands with lazy-loaded commands
const subCommands = new Map()
subCommands.set('lazy', lazyCommand)
subCommands.set('data', asyncDataCommand)

// Define the main command
const mainCommand = {
  name: 'lazy-async-example',
  description: 'Example of lazy loading and async command execution',
  run: () => {
    console.log('Lazy & Async Command Example')
    console.log('----------------------------')
    console.log('Available commands:')
    console.log('  lazy - A command that is loaded lazily')
    console.log('  data - A command that loads data asynchronously')
    console.log('\nRun with --help for more information')
  }
}

// Run the CLI with lazy-loaded commands
cli(process.argv.slice(2), mainCommand, {
  name: 'lazy-async-example',
  version: '1.0.0',
  description: 'Example of lazy loading and async command execution',
  subCommands
})

console.log('CLI setup complete. Waiting for command execution...')
