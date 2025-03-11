import { cli } from 'gunshi'

// Type-safe arguments parsing example
// This demonstrates how to define and use typed command options
const command = {
  name: 'type-safe',
  description: 'Demonstrates type-safe argument parsing',
  options: {
    // Define string option with short alias
    name: {
      type: 'string',
      short: 'n',
      description: 'Your name'
    },
    // Define number option with default value
    age: {
      type: 'number',
      short: 'a',
      default: 25,
      description: 'Your age'
    },
    // Define boolean flag
    verbose: {
      type: 'boolean',
      short: 'v',
      description: 'Enable verbose output'
    }
  },
  usage: {
    options: {
      name: 'Your name (string)',
      age: 'Your age (number, default: 25)',
      verbose: 'Enable verbose output (boolean)'
    },
    examples:
      '# Example usage\n$ node index.js --name John --age 30 --verbose\n$ node index.js -n John -a 30 -v'
  },
  run: ctx => {
    // Access typed values
    const { name, age, verbose } = ctx.values

    console.log('Type-safe example:')
    console.log(`Name: ${name || 'Not provided'} (${typeof name})`)
    console.log(`Age: ${age} (${typeof age})`)
    console.log(`Verbose: ${verbose} (${typeof verbose})`)

    if (verbose) {
      console.log('\nFull context:')
      console.log('Positionals:', ctx.positionals)
      console.log('All values:', ctx.values)
    }
  }
}

cli(process.argv.slice(2), command)
