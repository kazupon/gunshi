import { cli, define, lazy } from 'gunshi'

import type { CommandContext, CommandRunner } from 'gunshi'

// Define the command without command runner separately
const helloDefinition = define({
  name: 'hello',
  description: 'A greeting command',
  args: {
    name: {
      type: 'string',
      description: 'Name to greet',
      default: 'world'
    }
  }
})

// Create a loader function that returns the command implementation
const helloLoader = async (): Promise<CommandRunner> => {
  console.log('Loading hello command runner ...')

  // The actual command runner logic is defined here
  const run = (ctx: CommandContext) => {
    console.log(`Hello, ${ctx.values.name}!`)
  }

  return run // Return the runner function
}

// Combine them using the lazy helper
const lazyHello = lazy(helloLoader, helloDefinition)

// Use the lazy command in your CLI
const subCommands = {
  [lazyHello.commandName]: lazyHello
}

await cli(
  process.argv.slice(2),
  {
    description: 'My CLI application',
    run: () => console.log('Run a sub-command with --help for more info')
  },
  {
    name: 'my-app',
    version: '1.0.0',
    subCommands
  }
)
