# Type Safe

Gunshi provides excellent TypeScript support, allowing you to create type-safe command-line interfaces. This guide shows how to leverage TypeScript with Gunshi for better developer experience and code reliability.

## Benefits of Type Safety

Using TypeScript with Gunshi offers several advantages:

- **Autocompletion**: Get IDE suggestions for command options and properties
- **Error prevention**: Catch type-related errors at compile time
- **Better documentation**: Types serve as documentation for your code
- **Refactoring confidence**: Make changes with the safety net of type checking

## Basic TypeScript Usage

Here's a simple example of using Gunshi with TypeScript:

```ts
import { cli } from 'gunshi'
import type { ArgOptions, Command, CommandContext } from 'gunshi'

// Define a command with TypeScript types
const command: Command<ArgOptions> = {
  name: 'hello',
  options: {
    name: {
      type: 'string',
      short: 'n'
    }
  },
  run: (ctx: CommandContext<ArgOptions>) => {
    const { name = 'World' } = ctx.values
    console.log(`Hello, ${name}!`)
  }
}

// Execute the command
cli(process.argv.slice(2), command)
```

## Type-Safe Options and Values

For more precise type safety, you can define interfaces for your options and values:

```ts
import { cli } from 'gunshi'
import type { ArgOptions, Command, CommandContext } from 'gunshi'

// Define interfaces for options and values
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

interface UserValues {
  name?: string
  age: number
  verbose?: boolean
  help?: boolean
  version?: boolean
}

// Create a type-safe command
const command: Command<UserOptions> = {
  name: 'type-safe',
  options: {
    name: {
      type: 'string',
      short: 'n'
    },
    age: {
      type: 'number',
      short: 'a',
      default: 25
    },
    verbose: {
      type: 'boolean',
      short: 'v'
    }
  },
  run: (ctx: CommandContext<UserOptions, UserValues>) => {
    // TypeScript knows the types of these values
    const { name, age, verbose } = ctx.values

    console.log(`Name: ${name || 'Not provided'} (${typeof name})`)
    console.log(`Age: ${age} (${typeof age})`)
    console.log(`Verbose: ${verbose} (${typeof verbose})`)
  }
}

// Execute the command with type safety
cli(process.argv.slice(2), command)
```

## Using `satisfies` for Type Checking

TypeScript 4.9+ introduced the `satisfies` operator, which provides a more flexible way to type-check your commands:

```ts
import { cli } from 'gunshi'
import type { ArgOptions, Command, CommandContext } from 'gunshi'

// Define options with types
const options = {
  name: {
    type: 'string',
    short: 'n'
  },
  age: {
    type: 'number',
    short: 'a',
    default: 25
  },
  verbose: {
    type: 'boolean',
    short: 'v'
  }
} satisfies ArgOptions

// Create a type-safe command
const command = {
  name: 'type-safe',
  options,
  run: ctx => {
    // TypeScript infers the correct types from options
    const { name, age, verbose } = ctx.values
    console.log(`Hello, ${name || 'World'}! You are ${age} years old.`)

    if (verbose) {
      console.log('Verbose mode enabled')
    }
  }
} satisfies Command<typeof options>

// Execute the command
cli(process.argv.slice(2), command)
```

The `satisfies` approach has the advantage of letting TypeScript infer the types from your options definition, while still ensuring type safety.

## Type-Safe Sub-Commands

When working with sub-commands, you can maintain type safety:

```ts
import { cli } from 'gunshi'
import type { ArgOptions, Command } from 'gunshi'

// Define type-safe sub-commands
const createCommand: Command<ArgOptions> = {
  name: 'create',
  options: {
    name: { type: 'string', short: 'n' }
  },
  run: ctx => {
    console.log(`Creating: ${ctx.values.name}`)
  }
}

const listCommand: Command<ArgOptions> = {
  name: 'list',
  run: () => {
    console.log('Listing items...')
  }
}

// Create a Map of sub-commands
const subCommands = new Map<string, Command<ArgOptions>>()
subCommands.set('create', createCommand)
subCommands.set('list', listCommand)

// Define the main command
const mainCommand: Command<ArgOptions> = {
  name: 'app',
  run: () => {
    console.log('Use a sub-command: create, list')
  }
}

// Execute with type-safe sub-commands
cli(process.argv.slice(2), mainCommand, {
  subCommands
})
```

## Type-Safe Async Commands

For async commands, you can use TypeScript's async/await with proper typing:

```ts
import { cli } from 'gunshi'
import type { ArgOptions, Command, CommandContext } from 'gunshi'

// Define a type-safe async command
const command: Command<ArgOptions> = {
  name: 'async-example',
  options: {
    delay: {
      type: 'number',
      default: 1000
    }
  },
  run: async (ctx: CommandContext<ArgOptions>) => {
    const { delay } = ctx.values

    console.log(`Waiting for ${delay}ms...`)
    await new Promise(resolve => setTimeout(resolve, delay as number))
    console.log('Done!')
  }
}

// Execute the async command
cli(process.argv.slice(2), command)
```

## Next Steps

Now that you understand how to use TypeScript with Gunshi, you can:

- [Create composable sub-commands](/guide/essentials/composable) for more complex CLIs
- [Implement lazy loading](/guide/essentials/lazy-async) for better performance
- [Add internationalization](/guide/essentials/internationalization) to your CLI
