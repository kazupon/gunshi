# Getting Started

This guide will help you create your first command-line application with Gunshi. We'll start with a simple "Hello World" example and gradually explore more features.

## Hello World Example

Let's create a simple CLI application that greets the user. Create a new file (e.g., `index.js` or `index.ts`) and add the following code:

```js
import { cli } from 'gunshi'

// Run a simple command
cli(process.argv.slice(2), () => {
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

```
Hello, World!
```

## Adding Command-Line Arguments

Let's enhance our example to accept a name as an argument:

```js
import { cli } from 'gunshi'

cli(process.argv.slice(2), ctx => {
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

```
Hello, Alice!
```

## Adding Command Options

Let's add some options to our command:

```js
import { cli } from 'gunshi'

const command = {
  name: 'greeter',
  description: 'A simple greeting CLI',
  options: {
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

cli(process.argv.slice(2), command)
```

Now you can run:

```sh
node index.js --name Alice --uppercase
# or with short options
node index.js -n Alice -u
```

And you'll see:

```
HELLO, ALICE!
```

## Built-in Help

Gunshi automatically generates help information for your commands. Run:

```sh
node index.js --help
```

You'll see a help message that includes:

- Command description
- Available options
- Option descriptions

## Next Steps

Now that you've created your first CLI application with Gunshi, you can explore more advanced features:

- [Declarative Configuration](/guide/essentials/declarative-configuration) - Learn how to configure commands declaratively
- [Type Safe](/guide/essentials/type-safe) - Add type safety to your CLI with TypeScript
- [Composable](/guide/essentials/composable) - Create modular sub-commands
