# Nested Sub-Commands

Gunshi supports nested sub-commands, allowing you to build hierarchical command trees similar to tools like Git (`git remote add`) or Docker (`docker container ls`).

## Why Use Nested Sub-Commands?

Nested sub-commands are useful when your CLI has command groups with related operations:

- **Organization**: Group related operations under a parent command (e.g., `remote add`, `remote remove`)
- **Discoverability**: Users can explore available operations at each level with `--help`
- **Scalability**: Add new nested commands without cluttering the top-level command list

## Basic Nested Sub-Commands

You can nest sub-commands by adding a `subCommands` property to any command definition:

```ts [cli.ts]
import { cli, define } from 'gunshi'

// Define leaf commands
const addCommand = define({
  name: 'add',
  description: 'Add a remote',
  args: {
    url: { type: 'string', required: true, description: 'Remote URL' }
  },
  run: ctx => {
    console.log(`Adding remote: ${ctx.values.url}`)
  }
})

const removeCommand = define({
  name: 'remove',
  description: 'Remove a remote',
  args: {
    name: { type: 'positional', description: 'Remote name' }
  },
  run: ctx => {
    console.log(`Removing remote: ${ctx.values.name}`)
  }
})

// Define an intermediate command with nested sub-commands
const remoteCommand = define({
  name: 'remote',
  description: 'Manage remotes',
  subCommands: {
    add: addCommand,
    remove: removeCommand
  },
  run: () => {
    console.log('Use: git remote add|remove')
  }
})

// Define the entry command
const entry = define({
  name: 'main',
  description: 'Git-like CLI',
  run: () => {
    console.log('Run --help for available commands')
  }
})

await cli(process.argv.slice(2), entry, {
  name: 'git',
  version: '1.0.0',
  subCommands: {
    remote: remoteCommand
  }
})
```

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!TIP]
> The complete example code is [here](https://github.com/kazupon/gunshi/tree/main/playground/advanced/nested-sub-commands).

<!-- eslint-enable markdown/no-missing-label-refs -->

Now users can run:

```sh
# Execute nested sub-command
$ npx tsx cli.ts remote add --url https://example.com
Adding remote: https://example.com

# Show help for intermediate command
$ npx tsx cli.ts remote --help
Manage remotes

USAGE:
  git remote [COMMANDS] <OPTIONS>

COMMANDS:
  [remote] <OPTIONS>       Manage remotes
  add <OPTIONS>            Add a remote
  remove <OPTIONS>         Remove a remote

For more info, run any command with the `--help` flag:
  git remote --help
  git remote add --help
  git remote remove --help

# Show help for leaf command
$ npx tsx cli.ts remote add --help
Add a remote

USAGE:
  git remote add <OPTIONS>

OPTIONS:
  --url <url>          Remote URL
```

## Three or More Levels

You can nest commands to any depth:

```ts
const subSubCommand = define({
  name: 'sub-sub',
  description: 'A deeply nested command',
  run: ctx => {
    // ctx.commandPath will be ['level1', 'level2', 'sub-sub']
    console.log(`Command path: ${ctx.commandPath.join(' > ')}`)
  }
})

const level2Command = define({
  name: 'level2',
  description: 'Second level',
  subCommands: { 'sub-sub': subSubCommand },
  run: () => {}
})

const level1Command = define({
  name: 'level1',
  description: 'First level',
  subCommands: { level2: level2Command },
  run: () => {}
})
```

## Using `commandPath`

The `CommandContext` includes a `commandPath` property that tells you the full path of commands that were resolved:

```ts
const addCommand = define({
  name: 'add',
  description: 'Add a remote',
  run: ctx => {
    console.log(ctx.commandPath) // ['remote', 'add']
    console.log(ctx.callMode) // 'subCommand'
  }
})
```

| Invocation       | `commandPath`       | `callMode`     |
| ---------------- | ------------------- | -------------- |
| `cli`            | `[]`                | `'entry'`      |
| `cli remote`     | `['remote']`        | `'subCommand'` |
| `cli remote add` | `['remote', 'add']` | `'subCommand'` |

## Intermediate Commands

When a user invokes an intermediate command (one that has nested sub-commands) without specifying a child, the intermediate command's `run` function is called with `omitted: true`. In this case, the built-in help system automatically shows a COMMANDS section listing the available nested sub-commands:

```ts
const remoteCommand = define({
  name: 'remote',
  description: 'Manage remotes',
  subCommands: { add: addCommand },
  run: ctx => {
    if (ctx.omitted) {
      // User ran `cli remote` without specifying a sub-command
      // Help is shown automatically with COMMANDS section
      console.log('Please specify a sub-command: add, remove')
    }
  }
})
```

## Nested Sub-Commands with Lazy Loading

For large CLIs, you can combine nested sub-commands with lazy loading:

```ts
import { cli, define, lazy } from 'gunshi'

// Lazy-load the leaf command
const addCommand = lazy(() => import('./commands/remote-add.ts'), {
  name: 'add',
  description: 'Add a remote',
  args: {
    url: { type: 'string', required: true, description: 'Remote URL' }
  }
})

// The parent command can also be lazy-loaded
const remoteCommand = lazy(() => import('./commands/remote.ts'), {
  name: 'remote',
  description: 'Manage remotes',
  subCommands: {
    add: addCommand
  }
})

await cli(process.argv.slice(2), entry, {
  name: 'git',
  subCommands: { remote: remoteCommand }
})
```

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!IMPORTANT]
> When using `lazy()` with nested sub-commands, include `args` in the lazy definition (the second argument) if you want argument parsing to work before the command is loaded. The `subCommands` property is automatically carried over from the definition to the lazy command.

<!-- eslint-enable markdown/no-missing-label-refs -->

## Generating Documentation for Nested Commands

The `generate()` function supports nested command paths:

```ts
import { generate } from 'gunshi/generator'

// Generate help for a nested command using array or space-separated string
const help = await generate(['remote', 'add'], entry, {
  name: 'git',
  subCommands: { remote: remoteCommand }
})

// Or using space-separated string
const help2 = await generate('remote add', entry, { ... })
```
