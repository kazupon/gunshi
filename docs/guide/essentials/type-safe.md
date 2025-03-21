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
}

interface UserValues {
  name?: string
  age: number
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
    }
  },
  run: (ctx: CommandContext<UserOptions, UserValues>) => {
    // TypeScript knows the types of these values
    const { name, age } = ctx.values

    console.log(`Name: ${name || 'Not provided'} (${typeof name})`)
    console.log(`Age: ${age} (${typeof age})`)
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
  }
} satisfies ArgOptions

// Create a type-safe command
const command = {
  name: 'type-safe',
  options,
  run: ctx => {
    // TypeScript infers the correct types from options
    const { name, age } = ctx.values
    console.log(`Hello, ${name || 'World'}! You are ${age} years old.`)
  }
} satisfies Command<typeof options>

// Execute the command
cli(process.argv.slice(2), command)
```

The `satisfies` approach has the advantage of letting TypeScript infer the types from your options definition, while still ensuring type safety.
