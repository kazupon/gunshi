import { cli, define } from 'gunshi'

// Type-safe arguments parsing example using `define`
// This demonstrates how `define` automatically infers types

const command = define({
  name: 'type-safe-define',
  description: 'Demonstrates type-safe argument parsing with define',
  options: {
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
      short: 'V',
      description: 'Enable verbose output (boolean)'
    }
  },
  examples: `# Example usage:\n$ tsx index.ts --name John --age 30 --verbose\n$ tsx index.ts -n John -a 30 -V`,
  // `ctx` is automatically typed by `define`
  run: ctx => {
    // Access typed values with proper types inferred by `define`
    // name: string | undefined
    // age: number (due to default)
    // verbose: boolean | undefined
    const { name, age, verbose } = ctx.values

    console.log('Type-safe example using define:')
    console.log(`Name: ${name || 'Not provided'} (${typeof name})`) // Type is string | undefined
    console.log(`Age: ${age} (${typeof age})`) // Type is number
    console.log(`Verbose: ${!!verbose} (${typeof verbose})`) // Type is boolean | undefined

    if (verbose) {
      console.log('\nFull context:')
      console.log('Positionals:', ctx.positionals)
      console.log('All values:', ctx.values)

      // TypeScript knows the types thanks to `define`
      console.log('Age is a number:', typeof ctx.values.age === 'number') // Always true
      console.log(
        'Verbose is boolean or undefined:',
        typeof ctx.values.verbose === 'boolean' || ctx.values.verbose === undefined
      )
    }
  }
})

// Execute the command with type safety inferred by `define`
await cli(process.argv.slice(2), command)
