# `@gunshi/definition`

[![Version][npm-version-src]][npm-version-href]
[![InstallSize][install-size-src]][install-size-src]
[![JSR][jsr-src]][jsr-href]

> utilities for gunshi command definition

This package exports the bellow APIs and types.

- `define`: A function to define a command.
- `lazy`: A function to lazily load a command.
- Some basic type definitions, such as `Command`, `LazyCommand`, etc.

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!TIP]
> **The APIs and type definitions available in this package are the same as those in the `gunshi/definition` entry in the `gunshi` package.**
> This package is smaller in file size than the `gunshi` package, making it suitable for use when you want to reduce the size of the `node_modules` in your command you are creating.

<!-- eslint-enable markdown/no-missing-label-refs -->

## 💿 Installation

```sh
# npm
npm install --save @gunshi/definition

## pnpm
pnpm add @gunshi/definition

## yarn
yarn add @gunshi/definition

## deno
deno add jsr:@gunshi/definition

## bun
bun add @gunshi/definition
```

## 🚀 Usage

You can define the gunshi command as JavaScript module with using `define`, `defineWithTypes`, `lazy` and `lazyWithTypes`

The bellow example case which is using `define`:

```js
import { define } from '@gunshi/definition'

/**
 * define `say` command as javascript module
 */
export default define({
  name: 'say',
  args: {
    say: {
      type: 'string',
      description: 'say something',
      default: 'hello!'
    }
  },
  run: ctx => {
    return `You said: ${ctx.values.say}`
  }
})
```

## ©️ License

[MIT](http://opensource.org/licenses/MIT)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@gunshi/definition?style=flat
[npm-version-href]: https://npmjs.com/package/@gunshi/definition@alpha
[jsr-src]: https://jsr.io/badges/@gunshi/definition
[jsr-href]: https://jsr.io/@gunshi/definition
[install-size-src]: https://pkg-size.dev/badge/install/23122
