# Type Safe

In the previous chapter, we learned how to create commands using declarative configuration with plain JavaScript objects. While this approach works well, TypeScript users can benefit from enhanced type safety and better development experience using Gunshi's `define` function.

The `define` function wraps your command configuration and provides automatic type inference, ensuring that your command handlers receive properly typed context objects without manual type annotations.

## Benefits of Type Safety

Using TypeScript with Gunshi's `define` function provides CLI-specific advantages:

- **Autocompletion for command options**: IDE suggests available options when accessing `ctx.values`
- **Prevent runtime errors**: Catch typos in option names before your CLI ships
- **Self-documenting commands**: Types show exactly what arguments your command accepts
- **Safe refactoring**: Rename options across your codebase with confidence

## Type Safety Levels in Gunshi

Gunshi provides different levels of type safety to match your needs:

1. **Basic type inference** (covered in this chapter): Automatic typing of command arguments
2. **Plugin extension typing**: Type-safe access to plugin functionality
3. **Full type parameters**: Complete control over all types using `GunshiParams`

This chapter focuses on the first level, which covers most common use cases. Advanced patterns are available when you need them.

## Using `define` for Type Safety

The `define` function transforms your command configuration to provide:

- **Automatic type inference**: No need to manually type `ctx` parameters
- **IDE autocompletion**: Get suggestions for `ctx.values` properties
- **Compile-time validation**: TypeScript catches typos and type mismatches before runtime
- **Simplified imports**: No need to import type definitions like `Command` or `CommandContext`

Let's transform the greeting command from the previous chapter to use `define` for full type safety. The `define` function is a simple wrapper that preserves your command's type information, enabling TypeScript to automatically infer types for your command options and provide IDE autocompletion:

```ts [index.ts]
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
```

With `define`:

- You don't need to import types like `Command` or `CommandContext`.
- The `ctx` parameter in the `run` function automatically gets the correct type, derived from the `args` definition.
- Accessing `ctx.values.optionName` provides type safety and autocompletion based on the option's `type` and whether it has a `default`.
  - Options without a `default` (like `name`) are typed as `T | undefined`.
  - Options with a `default` (like `age`) are typed simply as `T`.
  - Boolean flags without a `default` (like `verbose`) are typed as `boolean | undefined`.

> [!NOTE]
> For boolean options that need both positive and negative forms (e.g., `--verbose` and `--no-verbose`), see the [Negatable Boolean Options](./declarative.md#negatable-boolean-options) section in the declarative configuration guide.

This approach significantly simplifies creating type-safe CLIs with Gunshi.

## When to Use `define`

Use the `define` function when:

- You're writing TypeScript and want automatic type inference
- You need IDE autocompletion for command context
- You want to catch type-related errors at compile time

Use plain objects (as shown in the previous chapter) when:

- You're writing plain JavaScript
- You prefer explicit type annotations
- You're integrating with existing type definitions

## Advanced Type Parameters

While the examples above show the simplest form of the `define` function, Gunshi provides more advanced type parameter patterns for complex scenarios:

- **Plugin extensions**: Type-safe access to plugin-provided functionality
- **Explicit argument types**: Fine-grained control over type inference
- **GunshiParams utility**: Combined typing of arguments and extensions

These advanced patterns are covered in detail in the [Advanced Type System](../advanced/type-system.md) documentation. For most commands, the basic `define` usage shown above provides sufficient type safety.

## Next Steps

Now that you understand how to create type-safe commands with `define`, you're ready to explore more advanced features:

- **Composable Sub-commands**: Learn how type safety extends to multi-command CLIs
- **Plugin System**: Discover how plugins maintain type safety across extensions
- **Advanced Type System**: For complex scenarios, Gunshi offers additional type parameters and patterns (covered in the [Advanced Type System](../advanced/type-system.md) documentation)

In the next chapter, we'll explore how to create [composable sub-commands](./composable.md) while maintaining the type safety we've established here.
