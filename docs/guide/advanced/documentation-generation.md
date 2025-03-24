# Documentation Generation

Gunshi provides a powerful feature for automatically generating documentation for your CLI applications. This guide explains how to use the `usageSilent` option and the return value of the `cli` function to generate documentation programmatically.

## Capturing Usage Information

When you run a command with the `--help` flag, Gunshi generates usage information. Normally, this information is displayed in the console, but you can also capture it programmatically using the `usageSilent` option:

```js
import { cli } from 'gunshi'
import { promises as fs } from 'node:fs'

// Define your command
const command = {
  name: 'my-command',
  description: 'A sample command',
  options: {
    input: {
      type: 'string',
      short: 'i'
    },
    output: {
      type: 'string',
      short: 'o'
    }
  },
  usage: {
    options: {
      input: 'Input file',
      output: 'Output file'
    }
  },
  run: ctx => {
    // Command implementation
  }
}

// Generate documentation
async function main() {
  // Capture the usage information by simulating --help
  const usageText = await cli(['--help'], command, {
    name: 'my-cli',
    version: '1.0.0',
    description: 'My CLI tool',
    usageSilent: true // Prevent output to console
  })

  // Now you can use the usage text to generate documentation
  await fs.writeFile('docs/cli-usage.md', `# CLI Usage\n\n\`\`\`\n${usageText}\n\`\`\``, 'utf8')

  console.log('Documentation generated successfully!')
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
```

## Generating Documentation for Multiple Commands

For CLIs with sub-commands, you can generate documentation for each command:

```js
import { cli } from 'gunshi'
import { promises as fs } from 'node:fs'

// Define your commands
const createCommand = {
  name: 'create',
  description: 'Create a new resource',
  options: {
    name: {
      type: 'string',
      short: 'n',
      required: true
    }
  },
  usage: {
    options: {
      name: 'Name of the resource'
    }
  },
  run: ctx => {
    // Command implementation
  }
}

const listCommand = {
  name: 'list',
  description: 'List all resources',
  options: {
    format: {
      type: 'string',
      short: 'f'
    }
  },
  usage: {
    options: {
      format: 'Output format (json, table)'
    }
  },
  run: ctx => {
    // Command implementation
  }
}

// Create a Map of sub-commands
const subCommands = new Map()
subCommands.set('create', createCommand)
subCommands.set('list', listCommand)

// Define the main command
const mainCommand = {
  name: 'manage',
  description: 'Manage resources',
  run: () => {
    // Main command implementation
  }
}

// Generate documentation for all commands
async function main() {
  const cliOptions = {
    name: 'my-cli',
    version: '1.0.0',
    description: 'My CLI tool',
    subCommands,
    usageSilent: true
  }

  // Generate main help
  const mainUsage = await cli(['--help'], mainCommand, cliOptions)
  await fs.writeFile('docs/cli-main.md', `# CLI Usage\n\n\`\`\`\n${mainUsage}\n\`\`\``, 'utf8')

  // Generate help for each sub-command
  for (const [name, _] of subCommands.entries()) {
    const commandUsage = await cli([name, '--help'], mainCommand, cliOptions)
    await fs.writeFile(
      `docs/cli-${name}.md`,
      `# ${name.charAt(0).toUpperCase() + name.slice(1)} Command\n\n\`\`\`\n${commandUsage}\n\`\`\``,
      'utf8'
    )
  }

  console.log('All documentation generated successfully!')
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
```

## Creating Rich Documentation

You can combine the captured usage information with additional content to create rich documentation:

```js
import { cli } from 'gunshi'
import { promises as fs } from 'node:fs'

// Generate rich documentation
async function main() {
  const command = {
    name: 'data-processor',
    description: 'Process data files',
    options: {
      input: {
        type: 'string',
        short: 'i',
        required: true
      },
      format: {
        type: 'string',
        short: 'f'
      },
      output: {
        type: 'string',
        short: 'o'
      }
    },
    usages: {
      options: {
        input: 'Input file path',
        format: 'Output format (json, csv, xml)',
        output: 'Output file path'
      }
    },
    run: ctx => {
      // Command implementation
    }
  }

  // Capture the usage information
  const usageText = await cli(['--help'], command, {
    name: 'data-processor',
    version: '1.0.0',
    description: 'A data processing utility',
    usageSilent: true
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

main().catch(error => {
  console.error(error)
  process.exit(1)
})
```

## Automating Documentation Generation

You can automate documentation generation as part of your build process:

```js
// scripts/generate-docs.js
import { cli } from 'gunshi'
import { promises as fs } from 'node:fs'
import path from 'node:path'

// Get the directory of the current module
const rootDir = path.resolve(import.meta.dirname, '..')
const docsDir = path.join(rootDir, 'docs')

// Import your commands
import { mainCommand, subCommands } from '../src/commands.js'

async function main() {
  const cliOptions = {
    name: 'my-cli',
    version: '1.0.0',
    description: 'My CLI tool',
    subCommands,
    usageSilent: true
  }

  // Generate main help
  const mainUsage = await cli(['--help'], mainCommand, cliOptions)

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
  for (const [name, _] of subCommands.entries()) {
    const commandUsage = await cli([name, '--help'], mainCommand, cliOptions)
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

main().catch(error => {
  console.error('Error generating documentation:', error)
  process.exit(1)
})
```

Then add a script to your `package.json`:

```json
{
  "scripts": {
    "docs:generate": "node scripts/generate-docs.js",
    "docs:build": "npm run docs:generate && vitepress build docs"
  }
}
```

## Generating Unix Man Pages

Unix man pages (short for "manual pages") are a traditional form of documentation for command-line tools on Unix-like operating systems. You can use Gunshi's `usageSilent` option to generate man pages for your CLI applications.

### Introduction to Man Pages

Man pages follow a specific format and are organized into sections:

- **NAME**: The name of the command and a brief description
- **SYNOPSIS**: The command syntax
- **DESCRIPTION**: A detailed description of the command
- **OPTIONS**: A list of available options
- **EXAMPLES**: Example usage
- **SEE ALSO**: Related commands or documentation
- **AUTHOR**: Information about the author

### Generating Man Pages with Gunshi

You can convert Gunshi's usage information to man page format using tools like [marked-man](https://github.com/kapouer/marked-man) or [roff](https://github.com/wooorm/roff):

```js
import { cli } from 'gunshi'
import { promises as fs } from 'node:fs'
import { execSync } from 'node:child_process'
import path from 'node:path'

async function main() {
  const command = {
    name: 'my-tool',
    description: 'A utility for processing data',
    options: {
      input: {
        type: 'string',
        short: 'i',
        required: true
      },
      output: {
        type: 'string',
        short: 'o'
      },
      format: {
        type: 'string',
        short: 'f'
      },
      verbose: {
        type: 'boolean',
        short: 'V'
      }
    },
    usage: {
      options: {
        input: 'Input file path',
        output: 'Output file path (defaults to stdout)',
        format: 'Output format (json, yaml, xml)',
        verbose: 'Enable verbose output'
      },
      examples: `# Process a file and output to stdout
$ my-tool --input data.csv

# Process a file and save to a specific format
$ my-tool --input data.csv --output result.yaml --format yaml

# Enable verbose output
$ my-tool --input data.csv --verbose`
    },
    run: ctx => {
      // Command implementation
    }
  }

  // Capture the usage information
  const usageText = await cli(['--help'], command, {
    name: 'my-tool',
    version: '1.0.0',
    description: 'A utility for processing data',
    usageSilent: true
  })

  // Create markdown content in man page format
  const manContent = `# my-tool(1) -- A utility for processing data

## SYNOPSIS

\`\`\`sh
${usageText.split('\n')[3].trim()}
\`\`\`

## DESCRIPTION

my-tool is a command-line utility for processing data files in various formats.

## OPTIONS

${usageText
  .split('OPTIONS:')[1]
  .split('\n')
  .filter(line => line.trim())
  .map(line => line.trim())
  .join('\n')}

## EXAMPLES

${command.usage.examples}

## AUTHOR

Generated by Gunshi

## SEE ALSO

https://github.com/your-username/my-tool
`

  // Write the markdown file
  const mdFile = path.join(process.cwd(), 'my-tool.1.md')
  await fs.writeFile(mdFile, manContent, 'utf8')

  // Convert markdown to man page format using marked-man
  // Note: You need to install marked-man first: npm install -g marked-man
  try {
    execSync(`marked-man --input ${mdFile} --output my-tool.1`)
    console.log('Man page generated successfully: my-tool.1')
  } catch (error) {
    console.error('Error generating man page:', error.message)
    console.log('Make sure marked-man is installed: npm install -g marked-man')
  }
}

main().catch(error => {
  console.error('Error generating documentation:', error)
  process.exit(1)
})
```

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
   ```json
   {
     "man": ["./man/my-tool.1"]
   }
   ```

### Viewing Man Pages

After installation, users can view your man page using:

```sh
man my-tool
```

## Best Practices

When generating documentation with Gunshi:

1. **Keep documentation in sync**: Automate documentation generation as part of your build process to ensure it stays up-to-date with your code.
2. **Enhance with examples**: Combine the auto-generated usage information with hand-written examples and explanations.
3. **Use custom renderers**: For more control over the format of the generated documentation, use custom renderers as described in [Custom Usage Generation](./custom-usage-generation.md).
4. **Test your documentation**: Ensure that the generated documentation accurately reflects the behavior of your CLI by including documentation tests in your test suite.
