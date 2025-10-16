import { define } from 'gunshi'
import { generate } from 'gunshi/generator'
import { promises as fs } from 'node:fs'

// Define your command
const command = define({
  name: 'my-command',
  description: 'A sample command',
  args: {
    input: {
      type: 'string',
      short: 'i',
      description: 'Input file'
    },
    output: {
      type: 'string',
      short: 'o',
      description: 'Output file'
    }
  }
})

// Generate documentation
async function main() {
  // Generate the usage information
  const usageText = await generate(null, command, {
    name: 'my-cli',
    version: '1.0.0',
    description: 'My CLI tool'
  })

  // Now you can use the usage text to generate documentation
  await fs.writeFile('docs/cli-usage.md', `# CLI Usage\n\n\`\`\`sh\n${usageText}\n\`\`\``, 'utf8')

  console.log('Documentation generated successfully!')
}

// Generate!
await main()
