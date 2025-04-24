# Type Safe

Gunshi provides excellent TypeScript support, allowing you to create type-safe command-line interfaces. The `define` function is the recommended way to leverage TypeScript with Gunshi for the best developer experience and code reliability.

## Benefits of Type Safety

Using TypeScript with Gunshi offers several advantages:

- **Autocompletion**: Get IDE suggestions for command options and properties
- **Error prevention**: Catch type-related errors at compile time
- **Better documentation**: Types serve as documentation for your code
- **Refactoring confidence**: Make changes with the safety net of type checking

## Using `define` for Type Safety

The `define` function automatically infers types from your command definition, providing autocompletion and compile-time checks without explicit type annotations.

Here's how to use `define`:

```ts
import { cli, define } from 'gunshi'

// Define a command using the `define` function
const command = define({
  name: 'greet',
  options: {
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
  // The 'ctx' parameter is automatically typed based on the options
  run: ctx => {
    // `ctx.values` is fully typed!
    const { name, age, verbose } = ctx.values

    // TypeScript knows the types:
    // - name: string | undefined (undefined if not provided)
    // - age: number (always a number due to the default)
    // - verbose: boolean (always boolean: true if --verbose, false if --no-verbose or omitted)

    let greeting = `Hello, ${name || 'stranger'}!`
    if (age !== undefined) {
      greeting += ` You are ${age} years old.`
    }

    console.log(greeting)

    if (verbose) {
      console.log('Verbose mode enabled.')
      console.log('Parsed values:', ctx.values)
    }
  }
})

// Execute the command
await cli(process.argv.slice(2), command)
```

With `define`:

- You don't need to import types like `Command` or `CommandContext`.
- The `ctx` parameter in the `run` function automatically gets the correct type, derived from the `options` definition.
- Accessing `ctx.values.optionName` provides type safety and autocompletion based on the option's `type` and whether it has a `default`.
  - Options without a `default` (like `name`) are typed as `T | undefined`.
  - Options with a `default` (like `age`) are typed simply as `T`.
  - Boolean flags (like `verbose`) are always typed as `boolean`. They resolve to `true` if the flag is present (e.g., `--verbose`), `false` if the negating flag is present (e.g., `--no-verbose`), and `false` if neither is present.

This approach significantly simplifies creating type-safe CLIs with Gunshi.
