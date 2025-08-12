# `@gunshi/bone`

[![Version][npm-version-src]][npm-version-href]
[![InstallSize][install-size-src]][install-size-src]
[![JSR][jsr-src]][jsr-href]

> gunshi minimum

This package exports the bellow APIs and types.

- `cli`: The main CLI function to run the command, **not included `@gunshi/plugin-global` and `@gunshi/plugin-renderer` built-in plugins**.
- some basic type definitions only.

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!TIP]
> **The APIs and type definitions available in this package are the same as those in the `gunshi/bone` entry in the `gunshi` package.**
> This package is smaller in file size than the `gunshi` package, making it suitable for use when you want to reduce the size of the `node_modules` in your cli application you are creating.

> [!IMPORTANT]
> You cannot use the `cli` function in this entry to display the usage of the command with `--help` option.
> This entry point is provided to allow users to customize it completely, such as command usage rendering and plugin composition.

<!-- eslint-enable markdown/no-missing-label-refs -->

## 💿 Installation

```sh
# npm
npm install --save @gunshi/bone

## pnpm
pnpm add @gunshi/bone

## yarn
yarn add @gunshi/bone

## deno
deno add jsr:@gunshi/bone

## bun
bun add @gunshi/bone
```

## 🚀 Usage

```js
import { cli } from 'gunshi/bone'
import global from '@gunshi/plugin-global'
import renderer from '@gunshi/plugin-renderer'
import i18n from '@gunshi/plugin-i18n'

const entry = ctx => {
  // entry logic ...
}

await cli(process.argv.slice(2), entry, {
  // ...
  plugins: [
    global(),
    renderer(),
    i18n({
      // plugin options ...
    })
  ]
})
```

## ©️ License

[MIT](http://opensource.org/licenses/MIT)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@gunshi/bone?style=flat
[npm-version-href]: https://npmjs.com/package/@gunshi/bone@alpha
[jsr-src]: https://jsr.io/badges/@gunshi/bone
[jsr-href]: https://jsr.io/@gunshi/bone
[install-size-src]: https://pkg-size.dev/badge/install/57026
