# @gunshi/plugin-global

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

## 🧩 Context Extensions

When using the global plugin, your command context is extended via `ctx.extensions['g:globals']`.

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!IMPORTANT]
> This plugin extension is namespaced in `CommandContext.extensions` using this plugin ID `g:globals` by the gunshi plugin system.

<!-- eslint-enable markdown/no-missing-label-refs -->

Available extensions:

- **`showVersion(): string`**: Display the application version. Returns `'unknown'` if no version is specified in the CLI configuration.

- **`showHeader(): Awaitable<string | undefined>`**: Display the application header. Returns `undefined` if no `renderHeader` function is provided in the CLI configuration.

- **`showUsage(): Awaitable<string | undefined>`**: Display the command usage information. This is automatically called when `--help` is used. Returns `undefined` if no `renderUsage` function is provided.

- **`showValidationErrors(error: AggregateError): Awaitable<string | undefined>`**: Display validation errors when argument validation fails. Returns `undefined` if `renderValidationErrors` is null.

### Usage Example

```ts
import global from '@gunshi/plugin-global'
import { cli } from 'gunshi'

const command = {
  name: 'deploy',
  run: async ctx => {
    // Access globals extensions
    const { showVersion, showHeader } = ctx.extensions['g:globals']

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
