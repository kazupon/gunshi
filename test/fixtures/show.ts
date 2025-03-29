import type { Command } from '../../src/types.ts'

const options = {
  catalog: {
    type: 'boolean',
    short: 'c',
    default: false,
    description: 'Display the catalog only'
  },
  dependency: {
    type: 'boolean',
    short: 'd',
    default: false,
    description: 'Display the catalogable dependencies only'
  }
} as const

const command: Command<typeof options> = {
  name: 'show',
  description: 'Show the catalog and catalogable dependencies (default command)',
  options,
  examples: `# Show the catalog and catalogable dependencies:
generator  # \`generator\` is equivalent to \`generator show\``,
  async run() {
    // something logic ...
  }
}

export default command
