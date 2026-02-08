# Composable Sub-commands

In [the previous chapter](./type-safe.md), you learned how to create type-safe commands using the `define` function.

Now, let's extend that knowledge to build CLIs with multiple sub-commands while maintaining the same type safety benefits.

Gunshi's composable sub-command system allows you to create modular, organized CLIs similar to tools like Git (with commands like `git commit` and `git push`).

## Why Use Sub-commands?

Sub-commands are useful when your CLI needs to perform different operations that warrant separate commands.

Benefits include:

- **Organization**: Group related functionality logically
- **Scalability**: Add new commands without modifying existing ones
- **User experience**: Provide a consistent interface for different operations
- **Help system**: Each sub-command can have its own help documentation
- **Plugin integration**: Plugins are shared across all sub-commands for consistent functionality

## Basic Structure

A CLI with sub-commands typically has this structure:

```sh
cli <command> [command options]
```

For example:

```sh
your-cli create --name my-resource
```

## Creating Type-Safe Sub-commands

Building on the `define` function from the previous chapter, let's create a CLI with multiple sub-commands:

```ts [cli.ts]
import { cli, define } from 'gunshi'

// Define type-safe sub-commands
const createCommand = define({
  name: 'create',
  description: 'Create a new resource',
  args: {
    name: { type: 'string', short: 'n', required: true }
  },
  run: ctx => {
    // ctx.values is fully typed
    console.log(`Creating resource: ${ctx.values.name}`)
  }
})

const listCommand = define({
  name: 'list',
  description: 'List all resources',
  run: () => {
    console.log('Listing all resources...')
  }
})

// Define the main command
const mainCommand = define({
  name: 'manage',
  description: 'Manage resources',
  run: ctx => {
    // This runs when no sub-command is provided
    console.log('Available commands: create, list')
    console.log('Run "manage --help" for more information')
  }
})

// Run the CLI with composable sub-commands
await cli(process.argv.slice(2), mainCommand, {
  name: 'my-app',
  version: '1.0.0',
  subCommands: {
    create: createCommand,
    list: listCommand
  }
})
```

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!TIP]
> The example fully code is [here](https://github.com/kazupon/gunshi/tree/main/playground/essentials/composable/basic).

<!-- eslint-enable markdown/no-missing-label-refs -->

This structure provides:

- Full type safety for all commands and sub-commands
- Automatic help generation for each command level
- Shared configuration across the command hierarchy

## Automatic Help for Sub-commands

Gunshi automatically generates help documentation for your sub-commands.

Using the code from the previous section, you can see the help for each command level:

```sh
# Show main command help
$ npx tsx cli.ts --help

# Show sub-command help
$ npx tsx cli.ts create --help
```

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!TIP]
> [`tsx`](https://github.com/privatenumber/tsx) is a TypeScript execution tool that allows you to run TypeScript files directly without compilation. Use it directly with `npx tsx`.

<!-- eslint-enable markdown/no-missing-label-refs -->

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!NOTE]
> On Node.js v22.6.0, you can run TypeScript with `--experimental-strip-types`:
>
> ```sh
> node --experimental-strip-types cli.ts --help
> ```
>
> From Node.js v23.6.0 and newer, type stripping is enabled by default (no flag needed for erasable TS). Features requiring transformation (e.g., `enum`) still need `--experimental-transform-types`.

<!-- eslint-enable markdown/no-missing-label-refs -->

Each sub-command's help includes its description, available options, and usage examples.

## Organizing Your Commands

As your CLI grows, organizing commands in separate files improves maintainability.

Here's a recommended project structure:

```sh
my-cli/
├── src/
│   ├── commands/
│   │   ├── create.ts      # Create command implementation
│   │   └── list.ts        # List command implementation
│   ├── main.ts            # Main command definition
│   └── cli.ts             # CLI entry point
├── package.json
└── tsconfig.json
```

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!TIP]
> The example fully code is [here](https://github.com/kazupon/gunshi/tree/main/playground/essentials/composable/organizing).

<!-- eslint-enable markdown/no-missing-label-refs -->

This structure provides:

- Clear separation of concerns
- Shared utilities across commands
- Centralized type definitions
- Easy testing of individual components

### Individual Command Files

```ts [commands/create.ts]
import { define } from 'gunshi'

export default define({
  name: 'create',
  description: 'Create a new resource',
  args: {
    name: {
      type: 'string',
      short: 'n',
      required: true,
      description: 'Name of the resource'
    },
    type: {
      type: 'string',
      short: 't',
      default: 'default',
      description: 'Type of resource'
    }
  },
  run: ctx => {
    console.log(`Creating ${ctx.values.type} resource: ${ctx.values.name}`)
  }
})
```

```ts [commands/list.ts]
import { define } from 'gunshi'

export default define({
  name: 'list',
  description: 'List all resources',
  args: {
    filter: {
      type: 'string',
      short: 'f',
      description: 'Filter resources'
    }
  },
  run: ctx => {
    const filter = ctx.values.filter || 'all'
    console.log(`Listing resources with filter: ${filter}`)
  }
})
```

### Main Command File

```ts [main.ts]
import { define } from 'gunshi'

export default define({
  name: 'manage',
  description: 'Manage resources',
  run: () => {
    console.log('Use a sub-command')
    console.log('Run "resource-manager --help" for available commands')
  }
})
```

### Entry Point

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!NOTE]
> Some code examples in this guide include TypeScript file extensions (`.ts`) in import/export statements. If you use this pattern in your application, you'll need to enable `allowImportingTsExtensions` in your `tsconfig.json`.

<!-- eslint-enable markdown/no-missing-label-refs -->

```ts [cli.ts]
import { cli } from 'gunshi'
import main from './main.ts'
import create from './commands/create.ts'
import list from './commands/list.ts'

await cli(process.argv.slice(2), main, {
  name: 'resource-manager',
  version: '1.0.0',
  subCommands: {
    create,
    list
  }
})
```

## Handling Unknown Sub-commands

By default, Gunshi shows an error when users provide an unknown sub-command.

You can customize this behavior using the `fallbackToEntry` option:

```ts [cli.ts]
await cli(process.argv.slice(2), main, {
  name: 'resource-manager',
  version: '1.0.0',
  fallbackToEntry: true,
  subCommands: {
    create,
    list
  }
})
```

This option enables flexible command handling:

```sh
# Runs the create sub-command
npx tsx src/cli.ts create --name resource
resource-manager (resource-manager v1.0.0)

Creating default resource: resource

# Runs the list sub-command
npx tsx src/cli.ts list --filter active
resource-manager (resource-manager v1.0.0)

Listing resources with filter: active

# Falls back to main command when "unknown" sub-command is not found
npx tsx src/cli.ts unknown --flag value
resource-manager (resource-manager v1.0.0)

Use a sub-command
Run "resource-manager --help" for available commands

# Runs the main command directly
npx tsx src/cli.ts --help
resource-manager (resource-manager v1.0.0)

USAGE:
  resource-manager [COMMANDS] <OPTIONS>

COMMANDS:
  [manage] <OPTIONS>       Manage resources
  create <OPTIONS>         Create a new resource
  list <OPTIONS>           List all resources

For more info, run any command with the `--help` flag:
  resource-manager --help
  resource-manager create --help
  resource-manager list --help

OPTIONS:
  -h, --help             Display this help message
  -v, --version          Display this version
```

This approach is particularly useful for CLIs that:

- Need to handle file paths or patterns as direct arguments
- Want to provide a default action when no sub-command matches
- Implement dynamic command resolution based on context

## Nested Sub-Commands

Gunshi also supports nested sub-commands for building hierarchical command trees like `git remote add`. You can add a `subCommands` property to any command definition:

```ts [cli.ts]
import { cli, define } from 'gunshi'

const addCommand = define({
  name: 'add',
  description: 'Add a remote',
  args: { url: { type: 'string', required: true } },
  run: ctx => console.log(`Adding: ${ctx.values.url}`)
})

const remoteCommand = define({
  name: 'remote',
  description: 'Manage remotes',
  subCommands: { add: addCommand },
  run: () => console.log('Use: remote add')
})

const entry = define({
  name: 'main',
  description: 'Git-like CLI',
  run: () => console.log('Run --help for available commands')
})

await cli(process.argv.slice(2), entry, {
  name: 'git',
  subCommands: { remote: remoteCommand }
})
```

For more details on nested sub-commands, including lazy loading, intermediate command handling, and `commandPath`, see the [Nested Sub-Commands](../advanced/nested-sub-commands.md) guide.

## Next Steps

Throughout this guide, you've learned how to build composable sub-commands that scale from simple to complex CLI applications.

You've seen how Gunshi maintains type safety across nested command structures, enables powerful routing patterns with default commands, and supports both synchronous and asynchronous command execution.

Now that you understand how to compose commands into well-organized hierarchies, you're ready to explore how to optimize their performance.

The next section on [Lazy & Async Command Loading](./lazy-async.md) will show you how to significantly improve your CLI's startup time by loading commands only when they're actually needed.

With composable sub-commands as your foundation, adding lazy loading will make your CLI applications both powerful and performant, especially as they grow to include many commands with varying resource requirements.
