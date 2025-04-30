import { cli, lazy } from 'gunshi'

import type { ArgOptions, Command, CommandContext, CommandRunner, LazyCommand } from 'gunshi'

// Define options as a constant object
const helloOptions = {
  name: {
    type: 'string',
    description: 'Name to greet',
    default: 'type-safe world'
  }
} satisfies ArgOptions // Use 'satisfies' for checking

// Define the command definition with the inferred options type
const typedHelloDefinition: Command<typeof helloOptions> = {
  name: 'hello',
  description: 'A type-safe lazy command',
  options: helloOptions // Use the options object
  // No 'run' needed in definition
}

// Define the typed loader function
// It must return a function matching CommandRunner<HelloOptionsType>
// or a Command<HelloOptionsType> containing a 'run' function.
const typedHelloLoader = async (): Promise<CommandRunner<typeof helloOptions>> => {
  console.log('Loading typed hello runner...')
  // Simulate loading delay
  await new Promise(resolve => setTimeout(resolve, 500))
  // const { runTypedHello } = await import('./commands/typedHello.js')
  // return runTypedHello

  // Define typed runner inline
  const runTypedHello = (ctx: CommandContext<typeof helloOptions>) => {
    // ctx.values is properly typed based on helloOptions
    console.log(`Hello, ${ctx.values.name}! (Typed)`)
  }
  return runTypedHello
}

// Create the type-safe LazyCommand
const lazyTypedHello: LazyCommand<typeof helloOptions> = lazy(
  typedHelloLoader,
  typedHelloDefinition
)

const subCommands = new Map()
subCommands.set('hello', lazyTypedHello)

// Define the main command
const mainCommand = {
  name: 'main',
  description: 'Root command for the type-safe lazy-async example.',
  run: () => {
    console.log('Type-Safe Lazy & Async Command Example - Use --help to see commands.')
  }
}

// Run the CLI
await cli(process.argv.slice(2), mainCommand, {
  name: 'typed-lazy-example', // Application name
  version: '1.0.0',
  description: 'Example CLI demonstrating type-safe lazy loading.',
  subCommands
})

console.log('CLI application finished.')
