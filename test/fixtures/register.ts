import type { Command } from '../../src/types.ts'

const options = {
  catalog: {
    type: 'string',
    short: 'c',
    default: 'default',
    description: 'Register the dependency, required. use with --alias and --catalog options'
  },
  dependency: {
    type: 'string',
    short: 'd',
    required: true,
    description: 'Register the alias, required. Use with --dependency and --catalog options'
  },
  alias: {
    type: 'string',
    short: 'a',
    required: true,
    description:
      "Register the catalog. Use with --dependency and --alias options. Default is 'default'"
  }
} as const

const command: Command<typeof options> = {
  name: 'register',
  description: 'Register the dependency to the catalog',
  options,
  examples: `# Register the dependency to the catalog:
generator register --dependency typescript --alias ^5.7.9 --catalog tools`,
  async run(_ctx) {
    // somthing logic ...
  }
}

export default command
