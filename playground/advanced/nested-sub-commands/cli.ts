import { cli, define, lazy } from 'gunshi'

/**
 * Leaf commands (deepest level)
 */

const addRemoteCommand = define({
  name: 'add',
  description: 'Add a remote',
  args: {
    url: {
      type: 'string',
      required: true,
      description: 'Remote URL'
    }
  },
  run: ctx => {
    console.log(`Added remote: ${ctx.values.url}`)
    console.log(`Command path: ${ctx.commandPath.join(' > ')}`)
  }
})

const removeRemoteCommand = define({
  name: 'remove',
  description: 'Remove a remote',
  args: {
    name: {
      type: 'positional',
      description: 'Remote name to remove'
    }
  },
  run: ctx => {
    console.log(`Removed remote: ${ctx.values.name}`)
    console.log(`Command path: ${ctx.commandPath.join(' > ')}`)
  }
})

/**
 * Intermediate command with nested sub-commands.
 * It has no `run`: `git remote` without a sub-command prints its usage, as `git remote --help` does.
 */

const remoteCommand = define({
  name: 'remote',
  description: 'Manage remotes',
  subCommands: {
    add: addRemoteCommand,
    remove: removeRemoteCommand
  }
})

/**
 * Lazy-loaded nested sub-command example
 */

const lazyBranchCommand = lazy(
  () =>
    Promise.resolve(
      define({
        name: 'create',
        description: 'Create a new branch',
        args: {
          name: {
            type: 'positional',
            required: true,
            description: 'Branch name'
          }
        },
        run: ctx => {
          console.log(`Created branch: ${ctx.values.name}`)
          console.log(`Command path: ${ctx.commandPath.join(' > ')}`)
        }
      })
    ),
  {
    name: 'create',
    description: 'Create a new branch',
    args: {
      name: {
        type: 'positional',
        required: true,
        description: 'Branch name'
      }
    }
  }
)

const branchCommand = define({
  name: 'branch',
  description: 'Manage branches',
  subCommands: {
    create: lazyBranchCommand
  }
})

/**
 * Entry point.
 * It has no `run` either: `git` without a command prints the usage.
 */

const entry = define({
  name: 'main',
  description: 'A Git-like CLI demonstrating nested sub-commands'
})

await cli(process.argv.slice(2), entry, {
  name: 'git',
  version: '1.0.0',
  description: 'A Git-like CLI',
  subCommands: {
    remote: remoteCommand,
    branch: branchCommand
  }
})
