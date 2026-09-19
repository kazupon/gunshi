# @gunshi/plugin-global

[![Version][npm-version-src]][npm-version-href]
[![InstallSize][install-size-src]][install-size-src]
[![JSR][jsr-src]][jsr-href]

> global options plugin for gunshi.

This plugin provides standard global options (`--help` and `--version`) for all commands in your CLI application. It's installed by default in gunshi, ensuring consistent behavior across all CLI applications.

## 💿 Installation

```sh
# npm
npm install --save @gunshi/plugin-global

# pnpm
pnpm add @gunshi/plugin-global

# yarn
yarn add @gunshi/plugin-global

# deno
deno add jsr:@gunshi/plugin-global

# bun
bun add @gunshi/plugin-global
```

## 🚀 Usage

```ts
import global from '@gunshi/plugin-global'
import { cli } from 'gunshi'

const command = {
  name: 'my-command',
  args: {
    target: {
      type: 'string',
      description: 'Target to process'
    }
  },
  run: ctx => {
    console.log(`Processing ${ctx.values.target}`)
  }
}

await cli(process.argv.slice(2), command, {
  name: 'my-cli',
  version: '1.0.0',
  plugins: [
    global() // Adds --help and --version options
  ]
})
```

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!TIP]
> This plugin is installed in gunshi **by default**. You don't need to explicitly add it unless you've disabled default plugins.

<!-- eslint-enable markdown/no-missing-label-refs -->

## ✨ Features

### Global Options

This plugin automatically adds the following options to all commands:

- **`--help`, `-h`**: Display the command usage and available options
- **`--version`, `-v`**: Display the application version

### Automatic Behavior

When these options are used:

- **With `--help`**: The command execution is bypassed, and the usage information is displayed instead
- **With `--version`**: The command execution is bypassed, and only the version number is printed

### Commands That Take the Name

`help` and `version` are not reserved. A command may declare an argument of its own under either name, and gunshi merges the arguments of a command over the global options, so the command's argument wins:

```js
import { define } from 'gunshi'

const release = define({
  name: 'release',
  args: {
    version: { type: 'string', description: 'Version to release' }
  },
  run: ctx => console.log(`releasing ${ctx.values.version}`)
})
```

`my-cli release --version 1.2.3` runs the command with `1.2.3`, rather than printing the version of the CLI. Two things follow from the command owning the name:

- The option no longer does what this plugin does automatically. `my-cli release --version` does not print the version of the CLI, and `--help` on a command that takes the name no longer shows its usage by itself — the command receives the value and decides, and it can still call `showUsage()` or `showVersion()` from `ctx.extensions['g:global']`
- The short name goes with it. The global schema is replaced whole, so `-v` (or `-h`) is no longer defined unless the command declares a `short` of its own

Other commands of the same CLI are unaffected, and so is the entry command unless it declares the name itself.

One case is left to this plugin on purpose: a schema that is identical to the one this plugin registers, field for field, cannot be told apart from it, so `version: { type: 'boolean', short: 'v', description: 'Display this version' }` still prints the version of the CLI. Any difference at all — a description of your own, an extra property, another type — makes the argument the command's.

## 🧩 Context Extensions

When using the global options plugin, your command context is extended via `ctx.extensions['g:global']`.

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!IMPORTANT]
> This plugin extension is namespaced in `CommandContext.extensions` using this plugin ID `g:global` by the gunshi plugin system.

<!-- eslint-enable markdown/no-missing-label-refs -->

Available extensions:

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!NOTE]
> The `Awaitable<T>` type used in the method signatures below is equivalent to `T | Promise<T>`, meaning the methods can return either a value directly or a Promise that resolves to that value.

<!-- eslint-enable markdown/no-missing-label-refs -->

- **`showVersion(): string`**: Display the application version. Returns `'unknown'` if no version is specified in the CLI configuration.

- **`showHeader(): Awaitable<string | undefined>`**: Display the application header. Returns `undefined` if no `renderHeader` function is provided in the CLI configuration.

- **`showUsage(): Awaitable<string | undefined>`**: Display the command usage information. This is automatically called when `--help` is used. Returns `undefined` if no `renderUsage` function is provided.

- **`showValidationErrors(error: AggregateError): Awaitable<string | undefined>`**: Display validation errors when argument validation fails. Returns `undefined` if `renderValidationErrors` is null.

### Usage Example

```ts
import global, { pluginId as globalId } from '@gunshi/plugin-global'
import { cli } from 'gunshi'

const command = {
  name: 'deploy',
  run: async ctx => {
    // Access global extensions
    const { showVersion, showHeader } = ctx.extensions[globalId]

    // Manually show version if needed
    console.log(`Deploying with CLI version: ${showVersion()}`)

    // Show custom header
    const header = await showHeader()
    if (header) {
      console.log(header)
    }

    // Your command logic here...
  }
}

await cli(process.argv.slice(2), command, {
  name: 'deploy-cli',
  version: '2.1.0',
  plugins: [global()],

  // Optional: Custom header renderer
  renderHeader: async () => {
    return `
╔══════════════════════╗
║   Deploy CLI v2.1.0  ║
╚══════════════════════╝
`
  }
})
```

## 📚 API References

See the [API References](./docs/index.md)

## ©️ License

[MIT](http://opensource.org/licenses/MIT)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@gunshi/plugin-global?style=flat
[npm-version-href]: https://npmjs.com/package/@gunshi/plugin-global@alpha
[jsr-src]: https://jsr.io/badges/@gunshi/plugin-global
[jsr-href]: https://jsr.io/@gunshi/plugin-global
[install-size-src]: https://pkg-size.dev/badge/install/39632
