# Documentation Generation

Gunshi provides a powerful feature for automatically generating documentation for your CLI applications.

This guide explains how to use the `generate` function to generate documentation programmatically.

## Using the `generate` Function

The following example demonstrates how to use the `generate` function to programmatically capture usage information for a command and save it to a documentation file:

```ts [cli.ts]
import { define } from 'gunshi'
import { generate } from 'gunshi/generator'
import { promises as fs } from 'node:fs'

import type { Command } from 'gunshi'

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
  // ... and define `run`
})

// Generate documentation
async function main() {
  // Generate the usage information
  const usageText: string = await generate(null, command, {
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
```

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!TIP]
> The example fully code is [here](https://github.com/kazupon/gunshi/tree/main/playground/advanced/docs-gen/basic).

<!-- eslint-enable markdown/no-missing-label-refs -->

The `generate` function programmatically captures usage information for your CLI commands and returns it as a string.

This allows you to generate documentation files, create API documentation, or integrate usage information into your build process.

Unlike the `cli` function which executes commands and prints output to the console, `generate` is designed specifically for documentation generation:

- **Silent Mode**: Internally sets `usageSilent: true` to capture output as a string rather than printing to console. When this flag is set, the internal `ctx.log` function is replaced with a no-op function, preventing console output while still returning the generated usage text
- **No Execution**: Only generates usage text without running command logic
- **Return Value**: Returns the generated usage text as a string (or empty string if generation fails)

The `generate` function takes three parameters:

- `command` (string | null): The sub-command name to generate documentation for. Pass `null` when generating documentation for the entry command or when you don't have sub-commands
- `entry` (Command | LazyCommand): The command object containing the command definition, or a lazy command that will be loaded to get the command
- `opts` (CliOptions): Optional configuration including:
  - `name`: The CLI program name
  - `version`: Version string to display
  - `description`: Program description
  - `subCommands`: Map of sub-commands (if applicable)
  - `renderHeader`, `renderUsage`: Custom renderer functions
  - **Note**: The `usageSilent` option is automatically set to `true` internally, so any value you provide will be overridden

Returns a Promise that resolves to the generated usage text as a string.

If no usage is generated (e.g., when renderUsage is not defined), returns an empty string.

## Generating Documentation for Multiple Commands

When your CLI has sub-commands, you can iterate through them to generate comprehensive documentation.

Here's how to generate documentation for each command separately:

```ts [cli.ts]
import { define } from 'gunshi'
import { generate } from 'gunshi/generator'
import { promises as fs } from 'node:fs'

import type { Command, CliOptions } from 'gunshi'

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
  // ... and define `run`
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
  // ... and define `run`
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
  // ... and define `run`
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
```

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!TIP]
> The example fully code is [here](https://github.com/kazupon/gunshi/tree/main/playground/advanced/docs-gen/sub-command).

<!-- eslint-enable markdown/no-missing-label-refs -->

## Creating Rich Documentation

You can combine the generated usage information with additional content to create rich documentation:

```ts
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
    // ... and define `run`
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
```

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!TIP]
> The example fully code is [here](https://github.com/kazupon/gunshi/tree/main/playground/advanced/docs-gen/rich).

<!-- eslint-enable markdown/no-missing-label-refs -->

## Automating Documentation Generation

You can automate documentation generation as part of your build process:

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!NOTE]
> The following example uses Node.js-specific `__dirname` approach. For cross-runtime compatibility:
>
> - **Deno**: Use `import.meta.dirname` or `fromFileUrl(import.meta.url)`
> - **Bun**: Use `import.meta.dir` or Node.js-compatible approach

<!-- eslint-enable markdown/no-missing-label-refs -->

```ts [scripts/generate-docs.ts]
import { generate } from 'gunshi/generator'
import { promises as fs } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

import type { Command, CliOptions } from 'gunshi'

// Get the directory of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const docsDir = path.join(rootDir, 'docs')

// Import your commands
import { mainCommand, subCommands } from '../src/commands.ts'

async function main() {
  const cliOptions: CliOptions = {
    name: 'my-cli',
    version: '1.0.0',
    description: 'My CLI tool',
    subCommands
  }

  // Generate main help
  const mainUsage = await generate(null, mainCommand, cliOptions)

  // Create the CLI reference page
  const cliReference = `# CLI Reference

## Main Command

\`\`\`sh
${mainUsage}
\`\`\`

## Sub-commands

`

  // Add each sub-command
  let fullReference = cliReference
  for (const name of Object.keys(subCommands)) {
    const commandUsage = await generate(name, mainCommand, cliOptions)
    fullReference += `### ${name.charAt(0).toUpperCase() + name.slice(1)}

\`\`\`sh
${commandUsage}
\`\`\`

`
  }

  // Write the documentation
  await fs.writeFile(path.join(docsDir, 'cli-reference.md'), fullReference, 'utf8')
  console.log('Documentation generated successfully!')
}

// Generate!
await main()
```

Then add a script to your `package.json`:

```json [package.json]
{
  "scripts": {
    "docs:generate": "tsx scripts/generate-docs.ts",
    "docs:build": "npm run docs:generate && vitepress build docs"
  }
}
```

## Generating Unix Man Pages

Unix man pages (short for "manual pages") are a traditional form of documentation for command-line tools on Unix-like operating systems.

You can use Gunshi's `generate` function to generate man pages for your CLI applications.

### Introduction to Man Pages

Man pages are the standard documentation format for Unix and Unix-like systems.

They provide comprehensive documentation directly accessible from the command line using the `man` command.

Man pages follow a specific structure with numbered sections (1 for user commands, 2 for system calls, etc.) and standardized formatting conventions.

The most common format for man pages is roff (runoff), though modern tools allow you to write documentation in simpler formats like Markdown and convert them to roff.

### Generating Man Pages with Gunshi

The following example demonstrates how to generate Unix man page documentation using Gunshi's `generate` function with a custom renderer.

The custom renderer (`renderManPageUsage`) creates markdown output that can be converted to the man page format (roff) using tools like `marked-man`.

The renderer function structures the output according to standard man page sections:

- **NAME**: Command name and brief description
- **SYNOPSIS**: Command syntax overview
- **DESCRIPTION**: Detailed command description
- **OPTIONS**: Available command-line options with descriptions
- **EXAMPLES**: Usage examples (references the command's help)
- **AUTHOR**: Author information
- **SEE ALSO**: Related documentation and resources

This approach allows you to maintain man pages alongside your CLI code, ensuring they stay synchronized:

```ts [cli.ts]
import { define } from 'gunshi'
import { generate } from 'gunshi/generator'
import { execFileSync } from 'node:child_process'
import { promises as fs } from 'node:fs'
import path from 'node:path'

import type { CommandContext } from 'gunshi'

// Define custom usage renderer that outputs markdown convertible to man page format (roff) using marked-man
function renderManPageUsage(ctx: CommandContext) {
  const lines: string[] = []

  // NAME
  lines.push(`# ${ctx.name}(1) -- ${ctx.description || 'CLI tool'}`, '')

  // SYNOPSIS
  lines.push('## SYNOPSIS')
  lines.push(`${ctx.env.name} <OPTIONS>`, '')

  // DESCRIPTION
  lines.push('## DESCRIPTION')
  lines.push(ctx.description || '', '')

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
    lines.push(`  ${schema.description || ''}`)
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
    // ... and define `run`
  })

  // Generate the usage with custom renderer
  const usageText = await generate(null, command, {
    name: 'my-tool',
    version: '1.0.0',
    description: 'A utility for processing data',
    renderHeader: null, // no display header on console
    renderUsage: renderManPageUsage // set custom usage renderer
  })

  // Prerequisites: Install marked-man for converting markdown to man page format
  // npm install -g marked-man
  // or add it to your project: npm install --save-dev marked-man

  // Write the markdown file
  const mdFile = path.join(process.cwd(), 'my-tool.1.md')
  await fs.writeFile(mdFile, usageText, 'utf8')

  // Convert markdown to man page format using marked-man
  try {
    execFileSync('marked-man', ['--input', mdFile, '--output', 'my-tool.1'])
    console.log('Man page generated successfully: my-tool.1')
  } catch (error) {
    console.error('Error generating man page:', (error as Error).message)
    console.log('Make sure marked-man is installed: npm install -g marked-man')
  }
}

// Generate!
await main()
```

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!TIP]
> The example fully code is [here](https://github.com/kazupon/gunshi/tree/main/playground/advanced/docs-gen/man)

<!-- eslint-enable markdown/no-missing-label-refs -->

### Installing Man Pages

Once you've generated a man page, you can install it on Unix-like systems:

1. **Local installation** (for development):

   ```sh
   # Copy to your local man pages directory
   cp my-tool.1 ~/.local/share/man/man1/
   # Update the man database
   mandb
   ```

2. **System-wide installation** (for packages):

   ```sh
   # Copy to the system man pages directory (requires sudo)
   sudo cp my-tool.1 /usr/local/share/man/man1/
   # Update the man database
   sudo mandb
   ```

3. **Package installation** (for npm packages):
   Add this to your `package.json`:
   ```json [package.json]
   {
     "man": ["./man/my-tool.1"]
   }
   ```

### Viewing Man Pages

After installation, users can view your man page using:

```sh
man my-tool
```

With the man page generation complete, let's look at broader guidelines for maintaining and generating documentation effectively.

## Documentation Generation Guidelines

When working with Gunshi's documentation generation features, consider these important guidelines:

### Keeping Documentation Current

Automating documentation generation as part of your build process ensures that your documentation stays synchronized with your code. This approach prevents documentation drift and maintains consistency across your project.

### Enhancing Generated Content

The auto-generated usage information provides a solid foundation, but combining it with hand-written examples and detailed explanations creates more valuable documentation. Consider adding context-specific examples that demonstrate real-world use cases.

### Leveraging Custom Renderers

For projects requiring specific documentation formats or styling, custom renderers provide fine-grained control over the output. See [Custom Rendering](./custom-rendering.md) for implementation details.

### Documentation Testing

Including documentation tests in your test suite verifies that the generated documentation accurately reflects your CLI's behavior. This practice helps catch discrepancies between implementation and documentation early in the development process.
