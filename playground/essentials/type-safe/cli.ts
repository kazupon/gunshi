import { cli, define } from 'gunshi'

// Define a command using the `define` function
const command = define({
  name: 'greet',
  args: {
    // Define a string option 'name' with a short alias 'n'
    name: {
      type: 'string',
      short: 'n',
      description: 'Your name'
    },
    // Define a number option 'age' with a default value
    age: {
      type: 'number',
      short: 'a',
      description: 'Your age',
      default: 30
    },
    // Define a boolean flag 'verbose'
    verbose: {
      type: 'boolean',
      short: 'v',
      description: 'Enable verbose output'
    }
  },
  // The 'ctx' parameter is automatically typed based on the args
  run: ctx => {
    // `ctx.values` is fully typed!
    const { name, age, verbose } = ctx.values

    // TypeScript knows the types:
    // - name: string | undefined (undefined if not provided)
    // - age: number (always a number due to the default)
    // - verbose: boolean | undefined (undefined if not provided, true if --verbose flag is used)

    let greeting = `Hello, ${name || 'stranger'}!`
    // age always has a value due to the default
    greeting += ` You are ${age} years old.`

    console.log(greeting)

    if (verbose) {
      console.log('Verbose mode enabled.')
      console.log('Parsed values:', ctx.values)
    }
  }
})

// Execute the command
await cli(process.argv.slice(2), command)
