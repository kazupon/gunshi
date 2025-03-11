import { cli } from 'gunshi'

// Declarative configuration example
// This demonstrates how to configure a command declaratively

// Define a command with declarative configuration
const command = {
  // Command metadata
  name: 'greet',
  description: 'A greeting command with declarative configuration',

  // Command options
  options: {
    name: {
      type: 'string',
      short: 'n'
    },
    greeting: {
      type: 'string',
      short: 'g',
      default: 'Hello'
    },
    times: {
      type: 'number',
      short: 't',
      default: 1
    }
  },

  // Command usage documentation
  usage: {
    options: {
      name: 'Name to greet',
      greeting: 'Greeting to use (default: "Hello")',
      times: 'Number of times to repeat the greeting (default: 1)'
    },
    examples:
      '# Examples\n$ node index.js --name World\n$ node index.js -n World -g "Hey there" -t 3'
  },

  // Command execution function
  run: ctx => {
    const { name = 'World', greeting, times } = ctx.values

    console.log('Declarative configuration example:')

    // Repeat the greeting the specified number of times
    for (let i = 0; i < times; i++) {
      console.log(`${greeting}, ${name}!`)
    }

    // Show the full configuration that was used
    console.log('\nCommand configuration:')
    console.log('Name:', ctx.name)
    console.log('Description:', ctx.description)
    console.log('Options:', ctx.options)
    console.log('Values:', ctx.values)
  }
}

// Run the command with the declarative configuration
cli(process.argv.slice(2), command, {
  name: 'declarative-example',
  version: '1.0.0',
  description: 'Example of declarative command configuration'
})
