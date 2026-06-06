# @gunshi/plugin-dryrun

[![Version][npm-version-src]][npm-version-href]
[![InstallSize][install-size-src]][install-size-src]
[![JSR][jsr-src]][jsr-href]

> dry-run option plugin for gunshi.

This plugin provides dry-run support for CLI applications, allowing command authors to mark side-effect operations that should be skipped when users pass `--dry-run`.

## 💿 Installation

```sh
# npm
npm install --save @gunshi/plugin-dryrun

# pnpm
pnpm add @gunshi/plugin-dryrun

# yarn
yarn add @gunshi/plugin-dryrun

# deno
deno add jsr:@gunshi/plugin-dryrun

# bun
bun add @gunshi/plugin-dryrun
```

## 🚀 Usage

```ts
import { cli, defineWithTypes } from 'gunshi'
import dryrun, { pluginId as dryrunId } from '@gunshi/plugin-dryrun'

import type { DryRunExtension } from '@gunshi/plugin-dryrun'

const command = defineWithTypes<{
  extensions: {
    [dryrunId]: DryRunExtension
  }
}>()({
  name: 'deploy',
  async run(ctx) {
    const dryRun = ctx.extensions[dryrunId]

    await dryRun.run(
      async function build() {
        // build artifacts
      },
      {
        message: 'build artifacts'
      }
    )
  }
})

await cli(process.argv.slice(2), command, {
  name: 'deploy-cli',
  plugins: [
    dryrun() // Adds the --dry-run option
  ]
})
```

When `--dry-run` is passed, the wrapped operation is skipped and the message is printed through `ctx.log()`:

```txt
[dryrun] build artifacts
```

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!IMPORTANT]
> The dry-run plugin does not skip the whole command. It only skips operations that command authors explicitly pass to `run()` or `wrap()`, so commands can still validate input, resolve configuration, and print useful context.

<!-- eslint-enable markdown/no-missing-label-refs -->

## ✨ Features

### Global Dry-run Option

This plugin adds a global `--dry-run` option to all commands.

You can customize the option key with the `name` option. For example, `name: 'pretend'` maps to `--pretend`.

### Explicit Side-effect Control

Dry-run behavior is opt-in per operation. Use:

- `run()`: Run or skip a single side-effect task
- `wrap()`: Wrap an existing function so every call respects dry-run mode

### Fallback Results

For non-void operations, provide `result` or `resolve` so command code can continue in dry-run mode without executing the real side effect.

```ts
const releaseId = await dryRun.run(
  async function createRelease() {
    return await api.createRelease()
  },
  {
    result: 'dry-run-release',
    message: 'create release'
  }
)
```

### Wrapping Existing Functions

`wrap()` is useful when you already have a side-effect function, such as a function from `node:fs`.

```ts
import { mkdir, writeFile } from 'node:fs/promises'

const writeOutputFile = dryRun.wrap(writeFile, {
  message: 'write output file'
})

await dryRun.run(
  async function createOutputDirectory() {
    await mkdir('dist', { recursive: true })
  },
  {
    message: 'create output directory'
  }
)

await writeOutputFile('dist/result.json', JSON.stringify({ ok: true }, null, 2))
```

## ⚙️ Plugin Options

### `name`

- Type: `string`
- Default: `'dryRun'`
- Description: The command value key for the dry-run option. With Gunshi's default kebab-case option handling, `dryRun` maps to `--dry-run`.

### `description`

- Type: `string`
- Default: `'Show what would be executed without running side effects'`
- Description: Fallback description for the dry-run global option.

### `descriptionResources`

- Type: `Record<string, string>`
- Default: `{}`
- Description: Localized global option descriptions used with `@gunshi/plugin-i18n`.

### `prefix`

- Type: `string`
- Default: `'[dryrun]'`
- Description: Prefix printed before dry-run messages.

## 🔗 Plugin Dependencies

The dry-run plugin has an optional dependency on the i18n plugin:

- **Plugin ID**: `g:i18n` (optional)
- **Purpose**: Provides localized descriptions for the dry-run global option
- **Effect**: When the i18n plugin is present, the dry-run option description can be localized through `descriptionResources`

Example with i18n resources:

```ts
dryrun({
  description: 'Show what would be executed without running side effects',
  descriptionResources: {
    'ja-JP': '副作用のある処理を実行せず、実行予定の内容を表示する'
  }
})
```

## 🧩 Context Extensions

When using the dry-run plugin, your command context is extended via `ctx.extensions['g:dryrun']`.

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!IMPORTANT]
> This plugin extension is namespaced in `CommandContext.extensions` using this plugin ID `g:dryrun` by the gunshi plugin system.

<!-- eslint-enable markdown/no-missing-label-refs -->

Available extensions:

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!NOTE]
> The `Awaitable<T>` type used in the method signatures below is equivalent to `T | Promise<T>`, meaning the methods can return either a value directly or a Promise that resolves to that value.

<!-- eslint-enable markdown/no-missing-label-refs -->

- `enabled: boolean`: Whether dry-run mode is enabled for the current command.

- `run<R>(task, options): Awaitable<R>`: Run a side-effect task normally, or skip it and print a dry-run message when dry-run mode is enabled.

- `wrap<A, R>(fn, options): (...args: A) => Awaitable<R>`: Wrap an existing side-effect function so calls are skipped and logged when dry-run mode is enabled.

### Usage Example

```ts
import dryrun, { pluginId as dryrunId } from '@gunshi/plugin-dryrun'
import { cli, defineWithTypes } from 'gunshi'

import type { DryRunExtension } from '@gunshi/plugin-dryrun'

const command = defineWithTypes<{
  extensions: {
    [dryrunId]: DryRunExtension
  }
}>()({
  name: 'publish',
  async run(ctx) {
    const dryRun = ctx.extensions[dryrunId]

    if (dryRun.enabled) {
      console.log('Previewing publish steps')
    }

    await dryRun.run(
      async function publishPackage() {
        // Publish package here
      },
      {
        message: 'publish package'
      }
    )
  }
})

await cli(process.argv.slice(2), command, {
  plugins: [dryrun()]
})
```

## 📚 API References

See the [API References](./docs/index.md)

## ©️ License

[MIT](http://opensource.org/licenses/MIT)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@gunshi/plugin-dryrun?style=flat
[npm-version-href]: https://npmjs.com/package/@gunshi/plugin-dryrun@alpha
[jsr-src]: https://jsr.io/badges/@gunshi/plugin-dryrun
[jsr-href]: https://jsr.io/@gunshi/plugin-dryrun
[install-size-src]: https://pkg-size.dev/badge/install/@gunshi/plugin-dryrun
