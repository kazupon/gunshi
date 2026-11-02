import { cli, define } from 'gunshi'
import completion from '../src/index.ts'

// Sub-commands given on the entry command, as an array, with a nested array

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

const remote = define({
  name: 'remote',
  description: 'Manage remotes',
  subCommands: [remoteAdd],
  run: () => {}
})

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
  name: 'git',
  description: 'Git-like CLI',
  subCommands: [remote, status]
})

await cli(process.argv.slice(2), entry, {
  name: 'git',
  version: '1.0.0',
  plugins: [completion()]
})
