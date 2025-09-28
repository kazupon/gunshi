# @gunshi/plugin-completion

[![Version][npm-version-src]][npm-version-href]
[![InstallSize][install-size-src]][install-size-src]
[![JSR][jsr-src]][jsr-href]

> shell completion plugin for gunshi.

This plugin provides tab completion functionality for your CLI applications, allowing users to auto-complete commands, options, and arguments in their shell. It generates shell-specific completion scripts and handles runtime completion suggestions.

This completion plugin is powered by [`@bomb.sh/tab`](https://github.com/bombshell-dev/tab)

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
- `powershell` - PowerShell completion

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!NOTE]
> Supported shells comply with [`@bomb.sh/tab`](https://github.com/bombshell-dev/tab)

<!-- eslint-enable markdown/no-missing-label-refs -->

## Shell Completion Setup

This section provides detailed instructions for setting up shell completions in different shells. The setup is a one-time process that enables tab completion for your CLI.

### Prerequisites

Shell completion requires Node.js runtime. Ensure your CLI is running with Node.js (not Deno or Bun).

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!WARNING]
> This package support Node.js runtime only. Deno and Bun support are coming soon.

<!-- eslint-enable markdown/no-missing-label-refs -->

### Setup by Shell

#### Bash

Bash users have multiple options for installing completion scripts. Choose the approach that best fits your system:

**Option 1: User-specific completion directory (Recommended)**

```sh
# Create the completion directory if it doesn't exist
mkdir -p ~/.local/share/bash-completion/completions

# Generate and install the completion script
your-cli complete bash > ~/.local/share/bash-completion/completions/your-cli

# Reload your shell configuration
source ~/.bashrc
```

**Option 2: Alternative user directory**

```sh
# Create the completion directory if it doesn't exist
mkdir -p ~/.bash_completion.d

# Generate and install the completion script
your-cli complete bash > ~/.bash_completion.d/your-cli

# Add this line to your ~/.bashrc (only needed once)
echo 'for f in ~/.bash_completion.d/*; do source "$f"; done' >> ~/.bashrc

# Reload your shell configuration
source ~/.bashrc
```

#### Zsh

Zsh requires adding the completion directory to your `fpath`:

```sh
# Create the completion directory if it doesn't exist
mkdir -p ~/.zsh/completions

# Add the completion directory to fpath in ~/.zshrc (only needed once)
echo 'fpath=(~/.zsh/completions $fpath)' >> ~/.zshrc
echo 'autoload -U compinit && compinit' >> ~/.zshrc

# Generate and install the completion script (note the underscore prefix)
your-cli complete zsh > ~/.zsh/completions/_your-cli

# Reload your shell configuration
source ~/.zshrc
# OR restart the shell
exec zsh
```

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!NOTE]
> Zsh completion files must start with an underscore (`_`) followed by the command name.

<!-- eslint-enable markdown/no-missing-label-refs -->

#### Fish

Fish shell has the simplest setup process:

```sh
# Create the completion directory if it doesn't exist
mkdir -p ~/.config/fish/completions

# Generate and install the completion script
your-cli complete fish > ~/.config/fish/completions/your-cli.fish

# Completions are loaded automatically - no reload needed
# Optionally, restart the shell for immediate effect
exec fish
```

#### PowerShell

PowerShell requires adding the completion script to your profile:

```powershell
# Create the profile directory if it doesn't exist
New-Item -ItemType Directory -Force -Path (Split-Path $PROFILE)

# Generate the completion script and test it
your-cli complete powershell | Out-String | Invoke-Expression

# To make it permanent, add it to your PowerShell profile
your-cli complete powershell >> $PROFILE

# Reload your profile
. $PROFILE
# OR restart PowerShell
```

### Troubleshooting

If completions don't work after setup:

1. **Check script generation**: Ensure `your-cli complete <shell>` outputs a valid script
2. **Verify file location**: Confirm the completion script is in the correct directory
3. **Reload shell**: Try opening a new terminal session
4. **Check permissions**: Ensure the completion file is readable (`chmod +r <file>`)
5. **Debug mode**: Some shells offer debug options:
   - Bash: `set -x` before sourcing
   - Zsh: `setopt xtrace` before sourcing
   - Fish: `fish --debug=complete`
   - Powershell: `Set-PSDebug -Trace 1`

### System-wide Installation

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!WARNING]
> System-wide installation requires root/administrator permissions and is not recommended for most users. User-specific installation is preferred as it doesn't require elevated privileges and is easier to manage.

<!-- eslint-enable markdown/no-missing-label-refs -->

If you need system-wide completions:

- **Bash**: `/etc/bash_completion.d/` or `/usr/share/bash-completion/completions/`
- **Zsh**: `/usr/share/zsh/site-functions/` or `/usr/local/share/zsh/site-functions/`
- **Fish**: `/usr/share/fish/vendor_completions.d/`
- **PowerShell**: for Moduele, `/usr/local/share/powershell/Modules/`, for system profiles, `$PSHOME\Profile.ps1`

### Updating Completions

When your CLI updates with new commands or options:

1. Regenerate the completion script: `your-cli complete <shell> > <path-to-completion-file>`
2. Reload your shell or start a new session

### Uninstalling Completions

To remove completion support:

1. Delete the completion script file
2. Remove any lines added to your shell configuration files (`.bashrc`, `.zshrc`, etc.)
3. Reload your shell or start a new session

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

- [`@bomb.sh/tab`](https://github.com/bombshell-dev/tab), created by [Bombshell](https://github.com/bombshell-dev) - Shell completion library

Thank you!

## ©️ License

[MIT](http://opensource.org/licenses/MIT)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@gunshi/plugin-completion?style=flat
[npm-version-href]: https://npmjs.com/package/@gunshi/plugin-completion@alpha
[jsr-src]: https://jsr.io/badges/@gunshi/plugin-completion
[jsr-href]: https://jsr.io/@gunshi/plugin-completion
[install-size-src]: https://pkg-size.dev/badge/install/30875
