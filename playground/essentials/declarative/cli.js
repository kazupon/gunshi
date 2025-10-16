import { cli } from 'gunshi'

// Define a command with declarative configuration
const command = {
  // Command metadata
  name: 'greet',
  description: 'A greeting command with declarative configuration',

  // Command arguments with descriptions
  args: {
    name: {
      type: 'string',
      short: 'n',
      description: 'Name to greet',
      default: 'World'
    },
    greeting: {
      type: 'string',
      short: 'g',
      default: 'Hello',
      description: 'Greeting to use'
    },
    uppercase: {
      type: 'boolean',
      short: 'u',
      description: 'Display greeting in uppercase'
    }
  },

  // Command examples
  examples: `
# Basic usage with default values
$ node greet.js

# Specify a name
$ node greet.js --name Alice

# Use custom greeting and name
$ node greet.js -n Bob -g "Good morning"

# Display in uppercase
$ node greet.js --name Charlie --uppercase
`,

  // Command execution function
  run: ctx => {
    const { name, greeting, uppercase } = ctx.values

    let message = `${greeting}, ${name}!`

    if (uppercase) {
      message = message.toUpperCase()
    }

    console.log(message)
  }
}

// Run the command with the declarative configuration
await cli(process.argv.slice(2), command, {
  name: 'greet-cli',
  version: '1.0.0',
  description: 'A simple greeting CLI'
})
