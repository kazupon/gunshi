# `@gunshi/plugin-global`

> global options plugin for gunshi

## 💿 Installation

```sh
# npm
npm install --save @gunshi/plugin-global

## pnpm
pnpm add @gunshi/plugin-global

## yarn
yarn add @gunshi/plugin-global

## deno
deno add jsr:@gunshi/plugin-global

## bun
bun add @gunshi/plugin-global
```

## 🚀 Usage

```js
import global from '@gunshi/plugin-global'
import { cli } from 'gunshi'

const entry = ctx => {
  // your entry ...
}

await cli(process.argv.slice(2), entry, {
  // ...

  plugins: [
    global() // install global options plugin
  ]
})
```

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!TIP]
> This plugin is installed in gunshi **as default**.

<!-- eslint-enable markdown/no-missing-label-refs -->

## ✨ Features

### Enable globally options

This plugin will add the following options to your all commands as globally.

- `--help`, `-h`: help option, which show the command usage
- `--version`, `-v`: version option, which show the your application version

### Extensions

This plugin extends gunshi's `CommandContext` to provide the following `GlobalsCommandContext`:

```ts
/**
 * Extended command context which provides utilities via global options plugin.
 * These utilities are available via `CommandContext.extensions.globals`.
 */
interface GlobalsCommandContext {
  /**
   * Show the version of the application. if `--version` option is specified, it will print the version to the console.
   * @returns The version of the application, or `unknown` if the version is not specified.
   */
  showVersion: () => string

  /**
   * Show the header of the application.
   * @returns The header of the application, or `undefined` if the `renderHeader` is not specified.
   */
  showHeader: () => Awaitable<string | undefined>

  /**
   * Show the usage of the application. if `--help` option is specified, it will print the usage to the console.
   * @returns The usage of the application, or `undefined` if the `renderUsage` is not specified.
   */
  showUsage: () => Awaitable<string | undefined>

  /**
   * Show validation errors. This is called when argument validation fails.
   * @param error The aggregate error containing validation failures
   * @returns The rendered error message, or `undefined` if `renderValidationErrors` is null
   */
  showValidationErrors: (error: AggregateError) => Awaitable<string | undefined>
}
```

TODO(kazupon): more explanation

## ©️ License

[MIT](http://opensource.org/licenses/MIT)
