# Getting Started

This guide will help you create your first command-line application with Gunshi. We'll start with a simple "Hello World" example and gradually explore more features.

## Hello World Example

Let's create a simple CLI application that greets the user. Create a new file (e.g., `index.js` or `index.ts`) and add the following code:

```js
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

```js
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

```js
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

- Command description
- Available options
- Option descriptions

This functionality is provided by Gunshi's built-in plugins (`@gunshi/plugin-global` and `@gunshi/plugin-renderer`), which are automatically included when you use the standard `cli()` function. These plugins also provide `--version` support and formatted output for your CLI.

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
