<p align="center">
	<img width="196" src="./assets/logo.png">
</p>
<h1 align="center">🏯 Gunshi</h1>

[![Version][npm-version-src]][npm-version-href]
[![CI][ci-src]][ci-href]
[![InstallSize][install-size-src]][install-size-src]
[![JSR][jsr-src]][jsr-href]

Gunshi is a modern javascript command-line library

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!TIP]
> gunshi (軍師) is a position in ancient Japanese samurai battle in which a samurai devised strategies and gave orders. That name is inspired by the word "command".

<!-- eslint-enable markdown/no-missing-label-refs -->

## ✨ Features

Gunshi is designed to simplify the creation of modern command-line interfaces:

- 📏 **Simple & Universal**: Run the commands with simple API and support universal runtime.
- ⚙️ **Declarative configuration**: Configure command modules declaratively for better organization and maintainability.
- 🛡️ **Type Safe**: TypeScript support with type-safe argument parsing and option resolution by [args-tokens](https://github.com/kazupon/args-tokens)
- 🧩 **Composable**: Create modular sub-commands that can be composed together for complex CLIs.
- ⏳ **Lazy & Async**: Load command modules lazily and execute them asynchronously for better performance.
- 📜 **Auto usage generation**: Generate helpful usage messages automatically for your commands.
- 🎨 **Custom usage generation**: Customize how usage messages are generated to match your CLI's style.
- 🌍 **Internationalization**: Support multiple languages with built-in i18n, locale resource lazy loading and i18n library integration.

## 💿 Installation

### 🐢 Node

```sh
# npm
npm install --save gunshi

## pnpm
pnpm add gunshi

## yarn
yarn add gunshi
```

### 🦕 Deno

```sh
deno add jsr:@kazupon/gunshi
```

### 🥟 Bun

```sh
bun add gunshi
```

## 🚀 Usage

### 📏 Simple API

Gunshi has a simple API that is a facade:

```js
import { cli } from 'gunshi'

const args = process.argv.slice(2)
// run a simple command
await cli(args, () => {
  // something logic ...
  console.log('Hello from Gunshi!', args)
})
```

### ⚙️ Declarative Configuration

Configure commands declaratively:

```js
import { cli } from 'gunshi'

// define a command with declarative configuration, using commandable object
const command = {
  name: 'greet',
  description: 'A greeting command',
  options: {
    name: {
      type: 'string',
      short: 'n',
      description: 'Name to greet'
    },
    greeting: {
      type: 'string',
      short: 'g',
      default: 'Hello',
      description: 'Greeting to use (default: "Hello")'
    },
    times: {
      type: 'number',
      short: 't',
      default: 1,
      description: 'Number of times to repeat the greeting (default: 1)'
    }
  },
  run: ctx => {
    const { name = 'World', greeting, times } = ctx.values
    for (let i = 0; i < times; i++) {
      console.log(`${greeting}, ${name}!`)
    }
  }
}

// run a command that is defined above
// (the 3rd argument of `cli` is the command option)
await cli(process.argv.slice(2), command, {
  name: 'my-app',
  version: '1.0.0',
  description: 'My CLI application'
})
```

For more detailed examples, check out the [playground/declarative](https://github.com/kazupon/gunshi/tree/main/playground/declarative) in the repository.

### 🛡️ Type-Safe Arguments

Gunshi provides type-safe argument parsing with TypeScript:

```ts
import { cli } from 'gunshi'
import type { ArgOptions, Command, CommandContext } from 'gunshi'

// type-safe arguments parsing example
// this demonstrates how to define and use typed command options with `satisfies`

// define 'type-safe' command options with types
const options = {
  // define string option with short alias
  name: {
    type: 'string',
    short: 'n'
  },
  // define number option with default value
  age: {
    type: 'number',
    short: 'a',
    default: 25
  },
  // define boolean flag
  verbose: {
    type: 'boolean',
    short: 'v'
  }
} satisfies ArgOptions

// define 'type-safe' command
const command = {
  name: 'type-safe',
  options,
  run: (ctx: CommandContext<UserOptions, UserValues>) => {
    const { name, age, verbose } = ctx.values
    console.log(`Hello, ${name || 'World'}! You are ${age} years old.`)
  }
} satisfies Command<typeof options>

await cli(process.argv.slice(2), command)
```

For more detailed examples, check out the [playground/type-safe](https://github.com/kazupon/gunshi/tree/main/playground/type-safe) in the repository.

### 🧩 Composable Sub-commands

Run a CLI with composable sub-commands:

```js
import { cli } from 'gunshi'

// define 'create' command
const createCommand = {
  name: 'create',
  description: 'Create a new resource',
  options: {
    name: { type: 'string', short: 'n' }
  },
  run: ctx => {
    console.log(`Creating resource: ${ctx.values.name}`)
  }
}

// define 'list' command
const listCommand = {
  name: 'list',
  description: 'List all resources',
  run: () => {
    console.log('Listing all resources...')
  }
}

// prepare a Map of sub-commands
const subCommands = new Map()
subCommands.set('create', createCommand)
subCommands.set('list', listCommand)

// define the main ('resource-manager') command
const mainCommand = {
  name: 'resource-manager',
  description: 'Manage resources',
  run: () => {
    console.log('Use one of the sub-commands: create, list')
  }
}

// run the CLI with composable sub-commands
await cli(process.argv.slice(2), mainCommand, {
  name: 'my-app',
  version: '1.0.0',
  subCommands
})
```

For more detailed examples, check out the [playground/composable](https://github.com/kazupon/gunshi/tree/main/playground/composable) in the repository.

### ⏳ Lazy & Async Command Loading

Load commands lazily and execute them asynchronously:

```js
import { cli } from 'gunshi'

// define a command that will be loaded lazily
const lazyCommand = async () => {
  // simulate async loading
  await new Promise(resolve => setTimeout(resolve, 1000))

  // return the actual command
  return {
    name: 'lazy',
    description: 'A command that is loaded lazily',
    run: async ctx => {
      // async execution
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log('Command executed!')
    }
  }
}

// prepare a Map of sub-commands with lazy-loaded commands
const subCommands = new Map()
subCommands.set('lazy', lazyCommand)

// run the CLI with lazy-loaded commands
await cli(
  process.argv.slice(2),
  { name: 'main', run: () => {} },
  {
    name: 'my-app',
    subCommands
  }
)
```

For more detailed examples, check out the [playground/lazy-async](https://github.com/kazupon/gunshi/tree/main/playground/lazy-async) in the repository.

### 📜 Auto Usage Generation

Gunshi automatically generates usage information:

```js
import { cli } from 'gunshi'

const command = {
  name: 'app',
  description: 'My application',
  options: {
    path: {
      type: 'string',
      short: 'p',
      description: 'File or directory path'
    },
    recursive: {
      type: 'boolean',
      short: 'r',
      description: 'Operate recursively on directories'
    },
    operation: {
      type: 'string',
      short: 'o',
      required: true,
      description: 'Operation to perform (list, copy, move, delete)'
    }
  },
  // define examples
  examples: '# Example\n$ my-app --operation list --path ./src',
  run: ctx => {
    // command implementation
  }
}

// run with --help to see the automatically generated usage information
await cli(process.argv.slice(2), command, {
  name: 'my-app',
  version: '1.0.0'
})
```

For more detailed examples, check out the [playground/auto-usage](https://github.com/kazupon/gunshi/tree/main/playground/auto-usage) in the repository.

### 🎨 Custom Usage Generation

Customize the usage message generation:

```js
import { cli } from 'gunshi'

// define custom header renderer
const customHeaderRenderer = ctx => {
  return Promise.resolve(`
╔═══════════════════════╗
║      ${ctx.env.name.toUpperCase()}      ║
╚═══════════════════════╝
${ctx.env.description}
Version: ${ctx.env.version}
`)
}

// define custom usage renderer
const customUsageRenderer = ctx => {
  const lines = []
  lines.push('USAGE:')
  lines.push(`  $ ${ctx.env.name} [options]`)
  lines.push('')
  lines.push('OPTIONS:')

  for (const [key, option] of Object.entries(ctx.options || Object.create(null))) {
    const shortFlag = option.short ? `-${option.short}, ` : '    '
    lines.push(`  ${shortFlag}--${key.padEnd(10)} ${ctx.translate(key)}`)
  }

  return Promise.resolve(lines.join('\n'))
}

// run with custom renderers
await cli(
  process.argv.slice(2),
  { name: 'app', run: () => {} },
  {
    name: 'my-app',
    version: '1.0.0',
    description: 'My application',
    renderHeader: customHeaderRenderer,
    renderUsage: customUsageRenderer
  }
)
```

For more detailed examples, check out the [playground/custom-usage](https://github.com/kazupon/gunshi/tree/main/playground/custom-usage) in the repository.

### 🌍 Internationalization

Support internationalization:

```js
import { cli } from 'gunshi'
import enUS from './locales/en-US.json' with { type: 'json' }

const command = {
  name: 'greeter',
  options: {
    name: {
      type: 'string',
      short: 'n',
      description: 'Name to greet'
    },
    formal: {
      type: 'boolean',
      short: 'f',
      description: 'Use formal greeting'
    }
  },
  examples:
    '# Basic greeting\n$ node index.js --name John\n\n# Formal greeting in Japanese\n$ MY_LOCALE=ja-JP node index.js --name 田中 --formal',
  // resource fetcher for translations
  resource: async ctx => {
    if (ctx.locale.toString() === 'ja-JP') {
      const resource = await import('./locales/ja-JP.json', { with: { type: 'json' } })
      return resource.default
    }

    // default to English
    return enUS
  },
  run: ctx => {
    const { name = 'World', formal } = ctx.values
    const greeting = formal ? ctx.translate('formal_greeting') : ctx.translate('informal_greeting')
    console.log(`${greeting}, ${name}!`)
  }
}

// run with locale support
await cli(process.argv.slice(2), command, {
  name: 'my-app',
  version: '1.0.0',
  // set the locale via an environment variable
  // if Node v21 or later is used, you can use the built-in `navigator.language` instead)
  locale: new Intl.Locale(process.env.MY_LOCALE || 'en-US')
})
```

For more detailed examples, check out the [playground/i18n](https://github.com/kazupon/gunshi/tree/main/playground/i18n) in the repository.

## 💁‍♀️ Showcases

- [pnpmc](https://github.com/kazupon/pnpmc): PNPM Catalogs Tooling

## 🙌 Contributing guidelines

If you are interested in contributing to `gunshi`, I highly recommend checking out [the contributing guidelines](/CONTRIBUTING.md) here. You'll find all the relevant information such as [how to make a PR](/CONTRIBUTING.md#pull-request-guidelines), [how to setup development](/CONTRIBUTING.md#development-setup)) etc., there.

## 💖 Credits

This project is inspired and powered by:

- [`citty`](https://github.com/unjs/citty), created by [UnJS team](https://github.com/unjs) and contributors
- [`ordana`](https://github.com/sapphi-red/ordana), createdy by [sapphi-red](https://github.com/sapphi-red), inspired documentation generation
- cline and claude 3.7 sonnet, examples and docs is generated

Thank you!

## ©️ License

[MIT](http://opensource.org/licenses/MIT)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/gunshi?style=flat
[npm-version-href]: https://npmjs.com/package/gunshi
[jsr-src]: https://jsr.io/badges/@kazupon/gunshi
[jsr-href]: https://jsr.io/@kazupon/gunshi
[install-size-src]: https://pkg-size.dev/badge/install/72346
[install-size-href]: https://pkg-size.dev/gunshi
[ci-src]: https://github.com/kazupon/gunshi/actions/workflows/ci.yml/badge.svg
[ci-href]: https://github.com/kazupon/gunshi/actions/workflows/ci.yml
