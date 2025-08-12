# @gunshi/plugin-completion

[![Version][npm-version-src]][npm-version-href]
[![InstallSize][install-size-src]][install-size-src]
[![JSR][jsr-src]][jsr-href]

> shell completion plugin for gunshi.

This plugin provides tab completion functionality for your CLI applications, allowing users to auto-complete commands, options, and arguments in their shell. It generates shell-specific completion scripts and handles runtime completion suggestions.

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!WARNING]
> This package support Node.js runtime only. Deno and Bun support are coming soon.

<!-- eslint-enable markdown/no-missing-label-refs -->

## 💿 Installation

```sh
# npm
npm install --save @gunshi/plugin-completion

# pnpm
pnpm add @gunshi/plugin-completion

# yarn
yarn add @gunshi/plugin-completion

# deno
deno add jsr:@gunshi/plugin-completion

# bun
bun add @gunshi/plugin-completion
```

## 🚀 Usage

```ts
import { cli } from 'gunshi'
import completion from '@gunshi/plugin-completion'

const command = {
  name: 'deploy',
  args: {
    environment: {
      type: 'string',
      short: 'e',
      description: 'Target environment'
    },
    config: {
      type: 'string',
      short: 'c',
      description: 'Config file path'
    }
  },
  run: ctx => {
    console.log(`Deploying to ${ctx.values.environment}`)
  }
}

await cli(process.argv.slice(2), command, {
  name: 'my-cli',
  version: '1.0.0',
  plugins: [
    completion({
      config: {
        entry: {
          args: {
            config: {
              handler: () => [
                { value: 'prod.json', description: 'Production config' },
                { value: 'dev.json', description: 'Development config' },
                { value: 'test.json', description: 'Test config' }
              ]
            }
          }
        }
      }
    })
  ]
})
```

## ✨ Features

### Automatic Complete Command

The plugin automatically adds a `complete` subcommand to your CLI:

```bash
# Generate shell completion script
my-cli complete bash > ~/.my-cli-completion.bash
source ~/.my-cli-completion.bash

# Now tab completion works!
my-cli dep<TAB>  # Completes to: my-cli deploy
my-cli deploy --env<TAB>  # Completes to: my-cli deploy --environment
```

### Shell Support

The `complete` command accepts the following shell types:

- `bash` - Bash shell completion
- `zsh` - Zsh shell completion
- `fish` - Fish shell completion

### Custom Completion Handlers

You can provide custom completion handlers for specific arguments:

```ts
completion({
  config: {
    entry: {
      args: {
        environment: {
          handler: ({ locale }) => [
            { value: 'production', description: 'Production environment' },
            { value: 'staging', description: 'Staging environment' },
            { value: 'development', description: 'Development environment' }
          ]
        }
      }
    },
    subCommands: {
      deploy: {
        args: {
          region: {
            handler: ({ previousArgs }) => {
              // Dynamic completions based on previous arguments
              const env = previousArgs.find(arg => arg.startsWith('--environment='))
              if (env?.includes('production')) {
                return [
                  { value: 'us-east-1', description: 'US East (N. Virginia)' },
                  { value: 'eu-west-1', description: 'EU (Ireland)' }
                ]
              }
              return [{ value: 'local', description: 'Local development' }]
            }
          }
        }
      }
    }
  }
})
```

### Internationalization Support

When used with `@gunshi/plugin-i18n`, completion descriptions are automatically localized:

```ts
import completion from '@gunshi/plugin-completion'
import i18n from '@gunshi/plugin-i18n'

await cli(args, command, {
  plugins: [
    i18n({ locale: 'ja-JP' }),
    completion() // Descriptions will be shown in Japanese
  ]
})
```

## ⚙️ Plugin Options

### `config`

- Type: `{ entry?: CompletionConfig, subCommands?: Record<string, CompletionConfig> }`
- Default: `{}`
- Description: Configuration for completion handlers

#### CompletionConfig

```ts
interface CompletionConfig {
  handler?: CompletionHandler // Handler for command-level completions
  args?: Record<
    string,
    {
      // Handlers for specific arguments
      handler: CompletionHandler
    }
  >
}
```

#### CompletionHandler

```ts
type CompletionHandler = (params: {
  previousArgs: string[] // Previously entered arguments
  toComplete: string // Current string being completed
  endWithSpace: boolean // Whether input ends with space
  locale?: Intl.Locale // Current locale (if i18n is enabled)
}) => CompletionItem[]

interface CompletionItem {
  value: string // The completion value
  description?: string // Optional description
}
```

## 🔗 Plugin Dependencies

The completion plugin has an optional dependency on the i18n plugin:

- **Plugin ID**: `g:i18n` (optional)
- **Purpose**: Provides localized descriptions for completions
- **Effect**: When the i18n plugin is present, all command and argument descriptions are automatically translated to the current locale

## 🧩 Context Extensions

When using the completion plugin, your command context is extended via `ctx.extensions['g:completion']`.

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!IMPORTANT]
> This plugin extension is namespaced in `CommandContext.extensions` using this plugin ID `g:completion` by the gunshi plugin system.

<!-- eslint-enable markdown/no-missing-label-refs -->

Currently, the completion plugin does not provide any context extensions for use within commands. The plugin ID can be imported for type-safe access:

```ts
import completion, { pluginId } from '@gunshi/plugin-completion'
```

## 📚 API References

See the [API References](./docs/index.md)

## 💖 Credits

This project uses and depends on:

- [`@bombsh/tab`](https://github.com/bombshell-dev/tab), created by [Bombshell](https://github.com/bombshell-dev) - Shell completion library

Thank you!

## ©️ License

[MIT](http://opensource.org/licenses/MIT)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@gunshi/plugin-completion?style=flat
[npm-version-href]: https://npmjs.com/package/@gunshi/plugin-completion@alpha
[jsr-src]: https://jsr.io/badges/@gunshi/plugin-completion
[jsr-href]: https://jsr.io/@gunshi/plugin-completion
[install-size-src]: https://pkg-size.dev/badge/install/30875
