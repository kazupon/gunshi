import { define } from 'gunshi'
import { generate } from 'gunshi/generator'
import { promises as fs } from 'node:fs'

// Generate rich documentation
async function main() {
  const command = define({
    name: 'data-processor',
    description: 'Process data files',
    args: {
      input: {
        type: 'string',
        short: 'i',
        required: true,
        description: 'Input file path'
      },
      format: {
        type: 'string',
        short: 'f',
        description: 'Output format (json, csv, xml)'
      },
      output: {
        type: 'string',
        short: 'o',
        description: 'Output file path'
      }
    }
  })

  // Generate the usage information
  const usageText = await generate(null, command, {
    name: 'data-processor',
    version: '1.0.0',
    description: 'A data processing utility'
  })

  // Create rich documentation
  const documentation = `
# Data Processor CLI

A command-line utility for processing data files in various formats.

## Installation

\`\`\`sh
npm install -g data-processor
\`\`\`

## Usage

\`\`\`sh
${usageText}
\`\`\`

## Examples

### Convert a CSV file to JSON

\`\`\`sh
data-processor --input data.csv --format json --output data.json
\`\`\`

### Process a file and print to stdout

\`\`\`sh
data-processor --input data.csv
\`\`\`

## Advanced Usage

For more complex scenarios, you can:

1. Chain commands with pipes
2. Use glob patterns for batch processing
3. Configure processing with a config file

## API Reference

The CLI is built on top of the data-processor library, which you can also use programmatically.
  `

  await fs.writeFile('docs/data-processor.md', documentation, 'utf8')
  console.log('Rich documentation generated successfully!')
}

// Generate!
await main()
