import { define } from 'gunshi'
import { generate } from 'gunshi/generator'
import { promises as fs } from 'node:fs'

import type { CliOptions } from 'gunshi'

// Define your commands
const createCommand = define({
  name: 'create',
  description: 'Create a new resource',
  args: {
    name: {
      type: 'string',
      short: 'n',
      required: true,
      description: 'Name of the resource'
    }
  }
})

const listCommand = define({
  name: 'list',
  description: 'List all resources',
  args: {
    format: {
      type: 'string',
      short: 'f',
      description: 'Output format (json, table)'
    }
  }
})

// Create a Map of sub-commands
const subCommands = {
  create: createCommand,
  list: listCommand
}

// Define the main command
const mainCommand = define({
  name: 'manage',
  description: 'Manage resources'
})

// Generate documentation for all commands
async function main() {
  const cliOptions: CliOptions = {
    name: 'my-cli',
    version: '1.0.0',
    description: 'My CLI tool',
    subCommands
  }

  // Generate main help
  const mainUsage = await generate(null, mainCommand, cliOptions)
  await fs.writeFile('docs/cli-main.md', `# CLI Usage\n\n\`\`\`sh\n${mainUsage}\n\`\`\``, 'utf8')

  // Generate help for each sub-command
  for (const name of Object.keys(subCommands)) {
    const commandUsage = await generate(name, mainCommand, cliOptions)
    await fs.writeFile(
      `docs/cli-${name}.md`,
      `# ${name.charAt(0).toUpperCase() + name.slice(1)} Command\n\n\`\`\`sh\n${commandUsage}\n\`\`\``,
      'utf8'
    )
  }

  console.log('All documentation generated successfully!')
}

// Generate!
await main()
