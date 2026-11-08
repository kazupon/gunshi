# Nested Sub-Commands

Gunshi supports nested sub-commands, allowing you to build hierarchical command trees similar to tools like Git (`git remote add`) or Docker (`docker container ls`).

## Why Use Nested Sub-Commands?

Nested sub-commands are useful when your CLI has command groups with related operations:

- **Organization**: Group related operations under a parent command (e.g., `remote add`, `remote remove`)
- **Discoverability**: Users can explore available operations at each level with `--help`
- **Scalability**: Add new nested commands without cluttering the top-level command list

## Basic Nested Sub-Commands

You can nest sub-commands by adding a `subCommands` property to any command definition. It is an object or a Map keyed by the sub-command names, or an array of commands, keyed by their names:

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

// Define an intermediate command with nested sub-commands. It needs no `run`:
// `git remote` without a sub-command prints its usage
const remoteCommand = define({
  name: 'remote',
  description: 'Manage remotes',
  subCommands: {
    add: addCommand,
    remove: removeCommand
  }
})

// Define the entry command, which only groups the commands too
const entry = define({
  name: 'main',
  description: 'Git-like CLI'
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

# Show help for intermediate command (`npx tsx cli.ts remote` prints the same)
$ npx tsx cli.ts remote --help
Manage remotes

USAGE:
  git remote [COMMANDS] <OPTIONS>

COMMANDS:
  add <OPTIONS>          Add a remote
  remove <name>          Remove a remote

For more info, run any command with the `--help` flag:
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
  subCommands: { 'sub-sub': subSubCommand }
})

const level1Command = define({
  name: 'level1',
  description: 'First level',
  subCommands: { level2: level2Command }
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

When a user invokes an intermediate command (one that has nested sub-commands) without specifying a child, Gunshi prints the usage of the intermediate command, with a COMMANDS section that lists its nested sub-commands, as `cli remote --help` does, and the exit code is `0`. An intermediate command needs no `run` for it:

```ts
const remoteCommand = define({
  name: 'remote',
  description: 'Manage remotes',
  subCommands: { add: addCommand }
})
```

Give an intermediate command a `run` only when it has something to do without a child, as `git remote` lists the remotes. Gunshi then calls the `run`, with `ctx.omitted` set to `true`, instead of printing the usage:

```ts
const remoteCommand = define({
  name: 'remote',
  description: 'Manage remotes',
  subCommands: { add: addCommand },
  run: ctx => {
    // `cli remote` without a sub-command: `ctx.omitted` is `true`
    console.log('origin')
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
> When using `lazy()` with nested sub-commands, include `args` in the lazy definition (the second argument) if you want argument parsing to work before the command is loaded. The `subCommands` of the definition, like the other properties it declares, is carried over to the lazy command, and is used when the loaded command does not define it.

Options can be placed at the start or between path segments, for example
`remote --config prod.json add origin`. Gunshi uses each candidate command's declared option metadata
to remove option values before matching `remote add`; the option is then parsed once for the selected
leaf. If a lazy parent or leaf can receive a leading option, declare that option in its lazy metadata.
Use `--` when the remaining values must stay in `ctx.rest` rather than being explored as another
sub-command.

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
