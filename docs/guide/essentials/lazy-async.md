# Lazy & Async Command Loading

Gunshi supports lazy loading of command runners and asynchronous execution, which can significantly improve the startup performance and responsiveness of your CLI applications, especially when dealing with many commands or resource-intensive operations.

## Why Use Lazy Loading?

Lazy loading Command Runners is beneficial when:

- Your CLI has many commands, but users typically only use a few at a time
- Some commands require heavy dependencies or complex initialization that isn't needed for other commands.
- You want to reduce the initial startup time and package size of your CLI. Gunshi can generate usage information based on the metadata provided without needing to load the actual `run` function.

## Using the `lazy` Helper

Gunshi provides a `lazy` helper function to facilitate lazy loading. It takes two arguments:

1. `loader`: An asynchronous function that returns the actual command logic when invoked. This can be either just the `CommandRunner` function (the `run` function) or the full `Command` object (which must include the `run` function).
2. `definition` (optional): A `Command` object containing the command's metadata (like `name`, `description`, `options`, `examples`). The `run` property in this definition object is ignored if provided, as the actual runner comes from the `loader`.

The `lazy` function attaches the metadata from the `definition` to the `loader` function itself. Gunshi uses this attached metadata to generate help messages (`--help`) without executing the `loader`. The `loader` is only executed when the command is actually run.

Here's how to implement lazy loading using the `lazy` helper:

```js
import { cli, lazy } from 'gunshi'

// Define the metadata for the command separately
const helloDefinition = {
  name: 'hello', // This name is used as the key in subCommands Map
  description: 'A command whose runner is loaded lazily',
  options: {
    name: {
      type: 'string',
      description: 'Name to greet',
      default: 'world'
    }
  },
  example: 'my-app hello --name=Gunshi'
  // No 'run' function needed here in the definition
}

// Define the loader function that returns the CommandRunner
const helloLoader = async () => {
  console.log('Loading hello command runner...')
  // Simulate loading time or dynamic import
  await new Promise(resolve => setTimeout(resolve, 500))
  // Dynamically import the actual run function (CommandRunner)
  // const { runHello } = await import('./commands/hello.js')
  // return runHello

  // For simplicity, we define the runner inline here
  const runHello = ctx => {
    console.log(`Hello, ${ctx.values.name}!`)
  }
  return runHello // Return only the runner function
}

// Create the LazyCommand using the lazy helper
const lazyHello = lazy(helloLoader, helloDefinition)

// Create a Map of sub-commands using the LazyCommand
const subCommands = new Map()
// Use the name from the definition as the key
subCommands.set(lazyHello.name, lazyHello)

// Define the main command
const mainCommand = {
  // name is optional for the main command if 'name' is provided in config below
  description: 'Example of lazy loading with the `lazy` helper',
  run: () => {
    // This runs if no sub-command is provided
    console.log('Use the hello sub-command: my-app hello')
  }
}

// Run the CLI
// Gunshi automatically resolves the LazyCommand and loads the runner when needed
await cli(process.argv.slice(2), mainCommand, {
  name: 'my-app', // Application name used in help messages
  version: '1.0.0',
  subCommands
})
```

In this example:

1.  We define the command's metadata (`helloDefinition`) separately from its execution logic (`helloLoader`). The definition does not need a `run` function.
2.  We use `lazy(helloLoader, helloDefinition)` to create `lazyHello`. This attaches the metadata from `helloDefinition` onto the `helloLoader` function.
3.  Gunshi uses the attached metadata (`lazyHello.name`, `lazyHello.options`, etc.) to generate help messages (`my-app --help` or `my-app hello --help`) _without_ executing (resolving) `helloLoader`.
4.  The `helloLoader` function is only called when the user actually runs `my-app hello`. It returns the `CommandRunner` function.
5.  This approach keeps the initial bundle small, as the potentially heavy logic inside the command runner (and its dependencies) is only loaded on demand.

Alternatively, the loader can return a full `Command` object:

```js
// loader returning a full Command object
const fullCommandLoader = async () => {
  console.log('Loading full command object...')
  await new Promise(resolve => setTimeout(resolve, 200))
  return {
    // name, description, options here are optional if provided in definition
    // but 'run' is required here!
    run: ctx => console.log('Full command object executed!', ctx.values)
  }
}

const lazyFullCommand = lazy(fullCommandLoader, {
  name: 'full',
  description: 'Loads a full command object',
  options: {
    test: { type: 'boolean' }
  }
})

// subCommands.set('full', lazyFullCommand)
// await cli(...)
```

## Async Command Execution

Gunshi naturally supports asynchronous command execution. The `CommandRunner` function returned by the `loader` (or the `run` function within the `Command` object returned by the `loader`) can be an `async` function.

```js
import { cli, lazy } from 'gunshi'

// Example with an async runner function returned by the loader
const asyncJobDefinition = {
  name: 'async-job',
  description: 'Example of a lazy command with an async runner',
  options: {
    duration: {
      type: 'number',
      short: 'd',
      default: 1000,
      description: 'Duration of the async job in milliseconds'
    }
  }
}

const asyncJobLoader = async () => {
  console.log('Loading async job runner...')
  // const { runAsyncJob } = await import('./commands/asyncJob.js')
  // return runAsyncJob

  // Define async runner inline
  const runAsyncJob = async ctx => {
    const { duration } = ctx.values
    console.log(`Starting async job for ${duration}ms...`)
    await new Promise(resolve => setTimeout(resolve, duration))
    console.log('Async job completed!')
  }
  return runAsyncJob // Return the async runner function
}

const lazyAsyncJob = lazy(asyncJobLoader, asyncJobDefinition)

const subCommands = new Map()
subCommands.set(lazyAsyncJob.commandName, lazyAsyncJob)

await cli(
  process.argv.slice(2),
  { name: 'main', run: () => console.log('Use the async-job sub-command') },
  {
    name: 'async-example', // Application name
    version: '1.0.0',
    subCommands
  }
)
```

## Type Safety with Lazy Loading

When using TypeScript, you can ensure type safety with lazy commands. Use plain objects for options and leverage `typeof` for type inference.

```ts
import { cli, lazy } from 'gunshi'
import type { Command, CommandContext, CommandRunner, LazyCommand, ArgOptions } from 'gunshi'

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
  name: 'hello-typed',
  description: 'A type-safe lazy command',
  options: helloOptions // Use the options object
  // No 'run' needed in definition
}

// Define the typed loader function
// It must return a function matching CommandRunner<typeof helloOptions>
// or a Command<typeof helloOptions> containing a 'run' function.
const typedHelloLoader = async (): Promise<CommandRunner<typeof helloOptions>> => {
  console.log('Loading typed hello runner...')
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
subCommands.set(lazyTypedHello.commandName, lazyTypedHello)

await cli(
  process.argv.slice(2),
  {
    name: 'main',
    run: () => console.log('Use the hello-typed sub-command')
  },
  {
    name: 'typed-lazy-example', // Application name
    version: '1.0.0',
    subCommands
  }
)
```

## Performance and Packaging Benefits

Using the `lazy(loader, definition)` helper for sub-commands offers significant advantages:

1.  **Faster Startup Time**: The main CLI application starts faster because it doesn't need to parse and load the code for _all_ command runners immediately. Gunshi only needs the metadata (provided via the `definition` argument) to build the initial help text.
2.  **Reduced Initial Memory Usage**: Less code loaded upfront means lower memory consumption at startup.
3.  **Smaller Package Size / Code Splitting**: When bundling your CLI for distribution (e.g., using `esbuild`, `rollup`, `webpack`), dynamic `import()` statements within your `loader` functions enable code splitting. This means the code for each command runner can be placed in a separate chunk, and these chunks are only loaded when the corresponding command is executed. This significantly reduces the size of the initial bundle users need to download or load.
