import { define } from 'gunshi'
import { generate } from 'gunshi/generator'
import { execFileSync } from 'node:child_process'
import { promises as fs } from 'node:fs'
import path from 'node:path'

import type { CommandContext } from 'gunshi'

// Define custom usage renderer,
// This custom usage renderer outputs in the markdown that can be converted to a man page format (roff) using marked-man.
function renderManPageUsage(ctx: CommandContext) {
  const lines: string[] = []

  // NAME
  lines.push(`# ${ctx.name}(1) -- ${ctx.description}`, '')

  // SYNOPSIS
  lines.push('## SYNOPSIS')
  lines.push(`${ctx.env.name} <OPTIONS>`, '')

  // DESCRIPTION
  lines.push('## DESCRIPTION')
  lines.push(ctx.description || '', '') // Direct access to description

  // OPTIONS
  lines.push('## OPTIONS')
  for (const [name, schema] of Object.entries(ctx.args)) {
    const options = [`\`--${name}\``]
    if (schema.short) {
      options.unshift(`\`-${schema.short}\``)
    }
    let value = ''
    if (schema.type !== 'boolean') {
      value = schema.default ? `[${name}]` : `<${name}>`
    }
    lines.push(`- ${options.join(', ')}${value ? ` ${value}` : ''}`)
    lines.push(`  ${schema.description || 'CLI tool'}`) // Direct access to schema description
    lines.push('')
  }

  // EXAMPLES
  lines.push('## EXAMPLES')
  lines.push('See command `--help` for examples', '')

  // AUTHOR
  lines.push('## AUTHOR')
  lines.push('Created by yours', '')

  // SEE ALSO
  lines.push('## SEE ALSO')
  lines.push('- man: `man my-tool`', '')
  lines.push('- website: https://my-tools.com/references/cli', '')
  lines.push('- repository: https://github.com/your-username/my-tool', '')

  return Promise.resolve(lines.join('\n'))
}

async function main() {
  const command = define({
    name: 'my-tool',
    description: 'A utility for processing data',
    args: {
      input: {
        type: 'string',
        short: 'i',
        required: true,
        description: 'Input file path'
      },
      output: {
        type: 'string',
        short: 'o',
        description: 'Output file path (defaults to stdout)'
      },
      format: {
        type: 'string',
        short: 'f',
        description: 'Output format (json, yaml, xml)'
      },
      verbose: {
        type: 'boolean',
        short: 'V',
        description: 'Enable verbose output'
      }
    },
    examples: `1. Process a file and output to stdout
$ my-tool --input data.csv

2. Process a file and save to a specific format
$ my-tool --input data.csv --output result.yaml --format yaml

3. Enable verbose output
$ my-tool --input data.csv --verbose`
  })

  // Generate the usage with custom renderer
  const usageText = await generate(null, command, {
    name: 'my-tool',
    version: '1.0.0',
    description: 'A utility for processing data',
    renderHeader: null, // no display header on console
    renderUsage: renderManPageUsage // set custom usage renderer
  })

  // Write the markdown file
  const mdFile = path.join(process.cwd(), 'my-tool.1.md')
  await fs.writeFile(mdFile, usageText, 'utf8')

  // Convert markdown to man page format using marked-man
  // Note: You need to install `marked-man` first: `npm install -g marked-man`
  try {
    if (process.env.GUNSHI_E2E) {
      execFileSync('npx', ['marked-man', '--input', mdFile, '--output', 'my-tool.1'])
    } else {
      execFileSync('marked-man', ['--input', mdFile, '--output', 'my-tool.1'])
    }
    console.log('Man page generated successfully: my-tool.1')
  } catch (error) {
    console.error('Error generating man page:', (error as Error).message)
    console.log('Make sure marked-man is installed: npm install -g marked-man')
  }
}

// Generate!
await main()
