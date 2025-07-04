# @gunshi/plugin-renderer

> usage renderer plugin for gunshi.

This plugin provides customizable rendering for CLI help messages, usage information, and validation errors. It automatically formats command descriptions, arguments, options, examples, and error messages in a consistent and readable format.

## 💿 Installation

```sh
# npm
npm install --save @gunshi/plugin-renderer

# pnpm
pnpm add @gunshi/plugin-renderer

# yarn
yarn add @gunshi/plugin-renderer

# deno
deno add jsr:@gunshi/plugin-renderer

# bun
bun add @gunshi/plugin-renderer
```

## 🚀 Usage

```ts
import renderer from '@gunshi/plugin-renderer'
import { cli, define } from 'gunshi'

const command = define({
  name: 'deploy',
  description: 'Deploy your application',
  args: {
    environment: {
      type: 'string',
      description: 'Target environment',
      required: true
    },
    force: {
      type: 'boolean',
      short: 'f',
      description: 'Force deployment without confirmation'
    }
  },
  examples: '$ deploy production --force',
  run: async ctx => {
    console.log(`Deploying to ${ctx.values.environment}...`)
  }
})

await cli(process.argv.slice(2), command, {
  name: 'deploy-cli',
  version: '1.0.0',
  plugins: [
    renderer() // Adds automatic help/usage rendering
  ]
})
```

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!TIP]
> The renderer plugin automatically decorates the header, usage, and validation error renderers. When users run `--help` or encounter validation errors, the plugin displays the information in a clean, readable format.

<!-- eslint-enable markdown/no-missing-label-refs -->

## ✨ Features

### Automatic Rendering

This plugin automatically handles rendering for:

- **Command Headers**: Displays command name and description
- **Usage Information**: Shows usage syntax, arguments, options, examples, and subcommands
- **Validation Errors**: Formats validation errors in a user-friendly way

### Internationalization Text Rendering

The plugin provides smart text rendering with automatic fallback:

- **With i18n plugin**: Uses translations from the i18n plugin
- **Without i18n plugin**: Falls back to default English messages and descriptions

### Rendered Example

When a user runs `--help`, the output looks like:

```sh
deploy - Deploy your application

USAGE
  $ deploy [options] <environment>

ARGUMENTS
  environment  Target environment

OPTIONS
  -f, --force  Force deployment without confirmation
  -h, --help   Display this help message

EXAMPLES
  $ deploy production --force
```

### Exported Functions

- **`renderHeader(ctx: CommandContext): Promise<string>`**: Renders the command header section
- **`renderUsage(ctx: CommandContext): Promise<string>`**: Renders the complete usage/help information
- **`renderValidationErrors(ctx: CommandContext, error: AggregateError): Promise<string>`**: Renders validation errors

## 🧩 Context Extensions

When using the renderer plugin, your command context is extended via `ctx.extensions['g:renderer']`.

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!IMPORTANT]
> This plugin extension is namespaced in `CommandContext.extensions` using this plugin ID `g:renderer` by the gunshi plugin system.

<!-- eslint-enable markdown/no-missing-label-refs -->

Available extensions:

- **`text<K>(key: K, values?: Record<string, unknown>): Promise<string>`**: Render text with optional i18n support. Handles built-in keys, argument descriptions, and custom keys intelligently.

- **`loadCommands<G>(): Promise<Command<G>[]>`**: Load and cache subcommands for rendering command lists. Results are cached after the first call for performance.

### Usage Example

```ts
import renderer from '@gunshi/plugin-renderer'
import { cli, define } from 'gunshi'

const deploy = define({
  name: 'deploy',
  description: 'Deploy the application',
  run: async ctx => {
    console.log('Deploying...')
  }
})

const test = define({
  name: 'test',
  description: 'Run tests',
  run: async ctx => {
    console.log('Running tests...')
  }
})

const entry = define({
  name: 'tools',
  run: async ctx => {
    // Access renderer extensions
    const { text, loadCommands } = ctx.extensions['g:renderer']

    // Render built-in message
    const usageHeader = await text('_:USAGE') // "USAGE" or translated
    console.log(usageHeader)

    // Load and display subcommands
    const subCommands = await loadCommands()
    console.log('\nAvailable commands:')
    for (const cmd of subCommands) {
      console.log(`  ${cmd.name}: ${cmd.description}`)
    }
  }
})

// Create subCommands Map
const subCommands = new Map()
subCommands.set(deploy.name, deploy)
subCommands.set(test.name, test)

await cli(process.argv.slice(2), command, {
  name: 'tools-cli',
  version: '1.0.0',
  subCommands,
  plugins: [renderer()],

  // Optional: Custom renderers
  renderHeader: async ctx => {
    return `=== ${ctx.env.name} v${ctx.env.version} ===`
  },
  renderUsage: async ctx => {
    // Your custom usage renderer
  }
})
```

### Integration with i18n Plugin

The renderer plugin has an optional dependency on the i18n plugin. When both plugins are used together, all rendered text automatically uses translations:

```ts
import renderer from '@gunshi/plugin-renderer'
import i18n from '@gunshi/plugin-i18n'
import resources from '@gunshi/resources'
import { cli } from 'gunshi'

await cli(args, command, {
  plugins: [
    i18n({
      locale: 'ja-JP',
      resources // Uses built-in resources from @gunshi/resources
    }),
    renderer() // Will use Japanese translations
  ]
})
```

#### With Custom Resources

You can extend the built-in resources with your own translations:

```ts
import renderer from '@gunshi/plugin-renderer'
import i18n from '@gunshi/plugin-i18n'
import resources from '@gunshi/resources'
import { cli } from 'gunshi'

// Extend built-in resources with custom messages
const customResources = {
  'en-US': {
    ...resources['en-US'],
    // Custom messages for your app
    APP_WELCOME: 'Welcome to My CLI Tool!',
    APP_PROCESSING: 'Processing your request...'
  },
  'ja-JP': {
    ...resources['ja-JP'],
    // Custom messages in Japanese
    APP_WELCOME: '私のCLIツールへようこそ！',
    APP_PROCESSING: 'リクエストを処理しています...'
  }
}

await cli(args, command, {
  plugins: [
    i18n({
      locale: 'ja-JP',
      resources: customResources
    }),
    renderer() // Will use Japanese translations including custom messages
  ]
})
```

### Custom Rendering

You can create custom plugins that use the renderer functions while adding your own branding or logic:

```ts
import { plugin } from '@gunshi/plugin'
import { renderUsage } from '@gunshi/plugin-renderer'

const customPlugin = plugin({
  id: 'my:custom',
  name: 'Custom Plugin',

  setup: ctx => {
    // Decorate with custom logic while using renderer functions
    ctx.decorateUsageRenderer(async (baseRenderer, cmdCtx) => {
      // Render usage via built-in usage renderer
      const standardUsage = await renderUsage(cmdCtx)

      // Add custom branding
      return `
╔══════════════════════════════════╗
║        MY AWESOME CLI            ║
╚══════════════════════════════════╝

${standardUsage}

© 2025 Your Company
`
    })
  }
})
```

## 📚 API References

See the [API References](./docs/index.md)

## ©️ License

[MIT](http://opensource.org/licenses/MIT)T)
