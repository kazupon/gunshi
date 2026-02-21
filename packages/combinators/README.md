# `@gunshi/combinators`

[![Version][npm-version-src]][npm-version-href]
[![InstallSize][install-size-src]][install-size-src]
[![JSR][jsr-src]][jsr-href]

> parser combinators for gunshi argument schema

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!WARNING]
> This package is currently **experimental**. The API may change in future versions.

<!-- eslint-enable markdown/no-missing-label-refs -->

This package provides composable factory functions for building type-safe argument schemas.

- **Base combinators**: `string`, `number`, `integer`, `float`, `boolean`, `choice`, `positional`, `combinator`
- **Modifier combinators**: `required`, `unrequired`, `withDefault`, `multiple`, `short`, `describe`, `map`
- **Schema combinators**: `args`, `merge`, `extend`

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!TIP]
> **The APIs and type definitions available in this package are the same as those in the `gunshi/combinators` entry in the `gunshi` package.**
> This package is smaller in file size than the `gunshi` package, making it suitable for use when you want to reduce the size of the `node_modules` in your command you are creating.

<!-- eslint-enable markdown/no-missing-label-refs -->

## 💿 Installation

```sh
# npm
npm install --save @gunshi/combinators

## pnpm
pnpm add @gunshi/combinators

## yarn
yarn add @gunshi/combinators

## deno
deno add jsr:@gunshi/combinators

## bun
bun add @gunshi/combinators
```

## 🚀 Usage

```ts
import { define } from '@gunshi/definition'
import {
  args,
  boolean,
  choice,
  integer,
  merge,
  required,
  short,
  string,
  withDefault
} from '@gunshi/combinators'

// Define reusable schema groups
const common = args({
  verbose: short(boolean(), 'v')
})

const network = args({
  host: withDefault(string(), 'localhost'),
  port: withDefault(integer({ min: 1, max: 65535 }), 3000)
})

// Compose schemas with merge()
export default define({
  name: 'serve',
  args: merge(
    common,
    network,
    args({
      mode: choice(['development', 'production'] as const),
      entry: required(string())
    })
  ),
  run: ctx => {
    // ctx.values is fully typed:
    // - host: string, port: number (always defined due to withDefault)
    // - verbose: boolean | undefined
    // - mode: 'development' | 'production' | undefined
    // - entry: string (always defined due to required)
    console.log(`${ctx.values.host}:${ctx.values.port}`)
  }
})
```

About details, See the below official docs sections:

- Experimentals:
  - [Parser Combinators](https://gunshi.dev/guide/experimentals/parser-combinators)

## ©️ License

[MIT](http://opensource.org/licenses/MIT)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@gunshi/combinators?style=flat
[npm-version-href]: https://npmjs.com/package/@gunshi/combinators@alpha
[jsr-src]: https://jsr.io/badges/@gunshi/combinators
[jsr-href]: https://jsr.io/@gunshi/combinators
[install-size-src]: https://pkg-size.dev/badge/install/23122
