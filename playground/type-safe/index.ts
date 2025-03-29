import type { ArgOptions, Command } from 'gunshi'

import { cli } from 'gunshi'

// Type-safe arguments parsing example
// This demonstrates how to define and use typed command options with `satisfies`

// Define options with types
const options = {
  // Define string option with short alias
  name: {
    type: 'string',
    short: 'n',
    description: 'Your name (string)'
  },
  // Define number option with default value
  age: {
    type: 'number',
    short: 'a',
    default: 25,
    description: 'Your age (number, default: 25)'
  },
  // Define boolean flag
  verbose: {
    type: 'boolean',
    short: 'v',
    description: 'Enable verbose output (boolean)'
  }
} satisfies ArgOptions

const command = {
  name: 'type-safe',
  description: 'Demonstrates type-safe argument parsing',
  options,
  examples:
    '# Example usage\n$ tsx index.ts --name John --age 30 --verbose\n$ tsx index.ts -n John -a 30 -v',
  run: ctx => {
    // Access typed values with proper types
    const { name, age, verbose } = ctx.values

    console.log('Type-safe example:')
    console.log(`Name: ${name || 'Not provided'} (${typeof name})`)
    console.log(`Age: ${age} (${typeof age})`)
    console.log(`Verbose: ${verbose} (${typeof verbose})`)

    if (verbose) {
      console.log('\nFull context:')
      console.log('Positionals:', ctx.positionals)
      console.log('All values:', ctx.values)

      // TypeScript knows the type of ctx.values
      console.log('Age is a number:', typeof ctx.values.age === 'number')
      console.log('Verbose is a boolean:', typeof ctx.values.verbose === 'boolean')
    }
  }
} satisfies Command<typeof options>

// Execute the command with type safety
await cli(process.argv.slice(2), command)
