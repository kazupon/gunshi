import { cli, define } from 'gunshi'
import completion from '../src/index.ts'

// Leaf commands under "remote"
const remoteAdd = define({
  name: 'add',
  description: 'Add a remote',
  args: {
    url: {
      type: 'string',
      description: 'Remote URL',
      short: 'u'
    }
  },
  run: () => {}
})

const remoteRemove = define({
  name: 'remove',
  description: 'Remove a remote',
  args: {
    name: {
      type: 'positional',
      description: 'Remote name'
    }
  },
  run: () => {}
})

// Intermediate command with nested sub-commands
const remote = define({
  name: 'remote',
  description: 'Manage remotes',
  subCommands: {
    add: remoteAdd,
    remove: remoteRemove
  },
  run: () => {}
})

// Top-level sub-command without nesting
const status = define({
  name: 'status',
  description: 'Show status',
  args: {
    short: {
      type: 'boolean',
      description: 'Short format',
      short: 's'
    }
  },
  run: () => {}
})

const entry = define({
  args: {
    verbose: {
      type: 'boolean',
      description: 'Verbose output',
      short: 'V'
    }
  },
  run: () => {}
})

await cli(process.argv.slice(2), entry, {
  name: 'git',
  version: '1.0.0',
  description: 'Git-like CLI',
  subCommands: {
    remote,
    status
  },
  plugins: [
    completion({
      config: {
        entry: {
          args: {
            verbose: {
              handler: () => []
            }
          }
        },
        subCommands: {
          'remote add': {
            args: {
              url: {
                handler: () => [
                  { value: 'https://github.com/user/repo.git', description: 'GitHub repo' },
                  { value: 'git@github.com:user/repo.git', description: 'GitHub SSH' }
                ]
              }
            }
          },
          'remote remove': {
            args: {
              name: {
                handler: () => [
                  { value: 'origin', description: 'Default remote' },
                  { value: 'upstream', description: 'Upstream remote' }
                ]
              }
            }
          }
        }
      }
    })
  ]
})
