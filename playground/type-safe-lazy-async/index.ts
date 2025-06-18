import { cli, define, lazy } from 'gunshi'

import type { CommandContext, CommandRunner, GunshiParams } from 'gunshi'

// Define the command definition with define function
const helloDefinition = define({
  name: 'hello',
  description: 'A type-safe lazy command',
  args: {
    name: {
      type: 'string',
      description: 'Name to greet',
      default: 'type-safe world'
    }
  }
  // No 'run' needed in definition
})

type HelloArgs = NonNullable<typeof helloDefinition.args>

// Define the loader function
// It must return a function matching CommandRunner<HelloArgs>
// or a Command<HelloArgs> containing a 'run' function.
const helloLoader = async (): Promise<CommandRunner<GunshiParams<{ args: HelloArgs }>>> => {
  console.log('Loading typed hello runner...')
  // Simulate loading delay
  await new Promise(resolve => setTimeout(resolve, 500))
  // const { run } = await import('./commands/typedHello.js')
  // return run

  // Define typed runner inline
  const run = (ctx: CommandContext<GunshiParams<{ args: HelloArgs }>>) => {
    // ctx.values is properly typed based on HelloArgs
    console.log(`Hello, ${ctx.values.name}! (Typed)`)
  }
  return run
}

// Create the type-safe LazyCommand
const lazyHello = lazy(helloLoader, helloDefinition)

const subCommands = new Map()
subCommands.set(lazyHello.commandName, lazyHello)

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
  name: 'typed-lazy-example',
  version: '1.0.0',
  description: 'Example CLI demonstrating type-safe lazy loading.',
  subCommands
})

console.log('CLI application finished.')
