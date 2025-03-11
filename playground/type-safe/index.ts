import type { ArgOptions, Command, CommandContext } from 'gunshi'

import { cli } from 'gunshi'

// Define the interface for our command options
interface UserOptions extends ArgOptions {
  name: {
    type: 'string'
    short: 'n'
  }
  age: {
    type: 'number'
    short: 'a'
    default: number
  }
  verbose: {
    type: 'boolean'
    short: 'v'
  }
}

// Define the interface for our command values
interface UserValues {
  name?: string
  age: number
  verbose?: boolean
  help?: boolean
  version?: boolean
}

// Type-safe arguments parsing example
// This demonstrates how to define and use typed command options
const command: Command<UserOptions> = {
  name: 'type-safe',
  description: 'Demonstrates type-safe argument parsing',
  options: {
    // Define string option with short alias
    name: {
      type: 'string',
      short: 'n'
    },
    // Define number option with default value
    age: {
      type: 'number',
      short: 'a',
      default: 25
    },
    // Define boolean flag
    verbose: {
      type: 'boolean',
      short: 'v'
    }
  },
  usage: {
    options: {
      name: 'Your name (string)',
      age: 'Your age (number, default: 25)',
      verbose: 'Enable verbose output (boolean)'
    },
    examples:
      '# Example usage\n$ tsx index.ts --name John --age 30 --verbose\n$ tsx index.ts -n John -a 30 -v'
  },
  run: (ctx: CommandContext<UserOptions, UserValues>) => {
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
      const typedValues: UserValues = ctx.values
      console.log('Age is a number:', typeof typedValues.age === 'number')
      console.log('Verbose is a boolean:', typeof typedValues.verbose === 'boolean')
    }
  }
}

// Execute the command with type safety
await cli(process.argv.slice(2), command)
