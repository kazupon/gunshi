# Getting Started

This guide will help you create your first command-line application with Gunshi. We'll start with a simple "Hello World" example and gradually explore more features.

## Hello World Example

Let's create a simple CLI application that greets the user. Create a new file (e.g., `index.js` or `index.ts`) and add the following code:

```js [index.js]
import { cli } from 'gunshi'

// Run a simple command
await cli(process.argv.slice(2), () => {
  console.log('Hello, World!')
})
```

This minimal example demonstrates the core concept of Gunshi: the `cli` function takes command-line arguments and a function to execute.

## Running Your CLI

You can run your CLI application with:

```sh
node index.js
```

You should see the output:

```sh
Hello, World!
```

## Adding Command-Line Arguments

Let's enhance our example to accept a name as an argument:

The function receives a `CommandContext` object (abbreviated as `ctx`) as its parameter. This context object contains parsed command-line arguments, options, and other execution information:

```js [index.js]
import { cli } from 'gunshi'

await cli(process.argv.slice(2), ctx => {
  // Access positional arguments
  const name = ctx.positionals[0] || 'World'
  console.log(`Hello, ${name}!`)
})
```

Now you can run:

```sh
node index.js Alice
```

And you'll see:

```sh
Hello, Alice!
```

## Adding Command Options

Let's add some options to our command:

```js [index.js]
import { cli } from 'gunshi'

const command = {
  name: 'greeter',
  description: 'A simple greeting CLI',
  args: {
    name: {
      type: 'string',
      short: 'n',
      description: 'Name to greet'
    },
    uppercase: {
      type: 'boolean',
      short: 'u',
      description: 'Convert greeting to uppercase'
    }
  },
  run: ctx => {
    const { name = 'World', uppercase } = ctx.values
    let greeting = `Hello, ${name}!`

    if (uppercase) {
      greeting = greeting.toUpperCase()
    }

    console.log(greeting)
  }
}

await cli(process.argv.slice(2), command)
```

Now you can run:

```sh
node index.js --name Alice --uppercase
# or with short options
node index.js -n Alice -u
```

And you'll see:

```sh
HELLO, ALICE!
```

## Built-in Help

Gunshi automatically generates help information for your commands through its built-in plugin system. Run:

```sh
node index.js --help
```

You'll see a help message that includes:

Here's an example of the generated help output:

```sh
USAGE:
  COMMAND <OPTIONS>

OPTIONS:
  -h, --help                 Display this help message
  -v, --version              Display this version
  -n, --name <name>          Name to greet
  -u, --uppercase            Convert greeting to uppercase
```

The help message automatically includes:

- Command description
- Available options
- Option descriptions

The standard `cli()` function automatically includes these built-in plugins:

- `@gunshi/plugin-global` - Provides global options like `--help` and `--version`
- `@gunshi/plugin-renderer` - Handles formatted output for help messages, error messages, and usage information

These plugins are included by default when you use `cli()` from the main 'gunshi' package. If you use the lower-level `run()` function instead, you'll need to manually configure these plugins to get help and version functionality.

> [!TIP]
> Want to learn more about Gunshi's plugin architecture? Check out the [Plugin System guide](./plugin-system.md) to understand how plugins work, explore the built-in plugins in detail, and learn how to create your own custom plugins to extend your CLI's functionality.

## Using Gunshi with Different Runtimes

Gunshi is designed to work seamlessly across multiple JavaScript runtimes. Here's how to use it with each supported environment:

### Node.js

For Node.js applications, use `process.argv.slice(2)` to pass command-line arguments:

```js
import { cli } from 'gunshi'

await cli(process.argv.slice(2), command)
```

### Deno

In Deno, use `Deno.args` to access command-line arguments:

```js
import { cli } from 'jsr:@gunshi/gunshi'

await cli(Deno.args, command)
```

### Bun

Bun also supports `Bun.argv` like Node.js:

```js
import { cli } from 'gunshi'

await cli(Bun.argv.slice(2), command) // or, `process.argv.slice(2)`, because bun support Node.js API compatible
```

Note that while the argument passing differs slightly between runtimes, the Gunshi API remains consistent across all environments.

## Next Steps

Now that you've created your first Gunshi CLI application, you can explore more advanced features:

- [Declarative Configuration](./declarative-configuration.md) - Organize your commands with declarative structure
- [Type Safety](./type-safe.md) - Learn how to use TypeScript for better type safety
- [Composable Commands](./composable.md) - Build complex CLIs with sub-commands
- [Auto Usage Generation](./auto-usage-generation.md) - Customize help messages
- [Lazy & Async Command Loading](./lazy-async.md) - Improve performance with lazy loading
- [Internationalization](./internationalization.md) - Add multi-language support

### Enhance Your CLI with Official Plugins

Gunshi provides several official plugins to enhance your CLI applications:

- [Plugin Ecosystem](./plugin-ecosystem.md) - Discover available plugins and how to use them
- **Shell Completion** - Add tab completion support with `@gunshi/plugin-completion`
- **Internationalization** - Comprehensive i18n support with `@gunshi/plugin-i18n`
- **Context Extensions** - Learn how plugins extend your command functionality
