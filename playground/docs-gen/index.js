import { generate } from 'gunshi/generator'
import { promises as fs } from 'node:fs'
import path from 'node:path'

// Define a command
const command = {
  name: 'doc-generator',
  description: 'A documentation generator example',
  args: {
    output: {
      type: 'string',
      short: 'o',
      default: './docs',
      description: 'Output directory for documentation'
    },
    format: {
      type: 'string',
      short: 'f',
      default: 'markdown',
      description: 'Output format (markdown, html)'
    },
    title: {
      type: 'string',
      short: 't',
      default: 'CLI Documentation',
      description: 'Documentation title'
    }
  },
  examples: `# Generate markdown documentation
$ node index.js --format markdown --output ./docs

# Generate HTML documentation with custom title
$ node index.js --format html --title "My CLI Tool" --output ./public`,
  run: async ctx => {
    const { output, format } = ctx.values
    // title is not used in this simple example but would be used in a real implementation
    // const { title } = ctx.values

    console.log(`Generating ${format} documentation in ${output}...`)

    // Implementation would go here
    console.log('Documentation generated successfully!')
  }
}

// This function demonstrates how to generate documentation using the generate function
async function generateDocs() {
  try {
    // Create output directory
    const outputDir = path.join(process.cwd(), 'generated-docs')
    await fs.mkdir(outputDir, { recursive: true })

    // Generate the usage information using the generate function
    const usageText = await generate(null, command, {
      name: 'doc-generator',
      version: '1.0.0',
      description: 'Documentation Generator Example'
    })

    // Generate markdown documentation
    const markdownContent = `# Documentation Generator

This is an example of using the \`generate\` function to generate documentation.

## Command Usage

\`\`\`sh
${usageText}
\`\`\`

## How It Works

This example demonstrates how to:

1. Use the \`generate\` function to generate usage information
2. Generate documentation from the captured text
3. Save the documentation to a file

## Implementation Details

The key part of this example is using the \`generate\` function:

\`\`\`js
const usageText = await generate(null, command, {
  name: 'doc-generator',
  version: '1.0.0',
  description: 'Documentation Generator Example'
})
\`\`\`

This generates the usage text that would normally be printed to the console,
allowing you to use it in your documentation. The \`generate\` function is a
convenient wrapper around the \`cli\` function with the \`--help\` flag and
\`usageSilent: true\` option.
`

    // Write the documentation file
    const outputFile = path.join(outputDir, 'README.md')
    await fs.writeFile(outputFile, markdownContent, 'utf8')

    console.log(`Documentation generated at: ${outputFile}`)
    console.log('Run the example with --help to see the usage information:')
    console.log('node index.js --help')
  } catch (error) {
    console.error('Error generating documentation:', error)
  }
}

// Generate documentation!
await generateDocs()
