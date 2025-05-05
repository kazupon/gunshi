import type { Command } from '../../src/types.ts'

const args = {
  catalog: {
    type: 'boolean',
    short: 'c',
    default: false,
    description: 'Display the catalog only'
  },
  dependency: {
    type: 'boolean',
    short: 'd',
    negatable: true,
    description: 'Display the catalogable dependencies only'
  }
} as const

const command: Command<typeof args> = {
  name: 'show',
  description: 'Show the catalog and catalogable dependencies (default command)',
  args,
  examples: `# Show the catalog and catalogable dependencies:
generator  # \`generator\` is equivalent to \`generator show\``,
  async run() {
    // something logic ...
  }
}

export default command
