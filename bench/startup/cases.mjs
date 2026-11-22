// The cases of the startup benchmark: a CLI of fixtures/ and the arguments it is run with.
export const BASELINE = { id: 'node', fixture: 'empty.mjs', args: [], label: 'Node.js alone' }

export const CASES = [
  { id: 'command', fixture: 'command.mjs', args: [], label: 'A command' },
  { id: 'command-help', fixture: 'command.mjs', args: ['--help'], label: 'A command, `--help`' },
  {
    id: 'command-version',
    fixture: 'command.mjs',
    args: ['--version'],
    label: 'A command, `--version`'
  },
  {
    id: 'subcommands-help',
    fixture: 'subcommands.mjs',
    args: ['--help'],
    label: '5 sub-commands, `--help`'
  },
  {
    id: 'subcommands-run',
    fixture: 'subcommands.mjs',
    args: ['build'],
    label: '5 sub-commands, `build`'
  },
  { id: 'plugins', fixture: 'plugins.mjs', args: [], label: 'i18n and completion plugins' },
  {
    id: 'plugins-help',
    fixture: 'plugins.mjs',
    args: ['--help'],
    label: 'i18n and completion plugins, `--help`'
  },
  {
    id: 'plugins-complete',
    fixture: 'plugins.mjs',
    args: ['complete', '--', '--'],
    label: 'A completion request'
  },
  {
    id: 'definition',
    fixture: 'definition.mjs',
    args: ['build'],
    label: '`gunshi/definition` and `gunshi`'
  },
  { id: 'bone', fixture: 'bone.mjs', args: [], label: '`@gunshi/bone`' }
]
