# Documentation Generation

Gunshi can help you generate comprehensive documentation for your command-line interfaces. This guide explains how to leverage Gunshi's features to create user-friendly documentation for your CLI applications.

## Why Generate Documentation?

Documentation is essential for CLI applications because it helps users understand:

- What commands are available
- What options each command supports
- How to use the commands effectively
- Examples of common usage patterns

While Gunshi provides built-in help messages through the `--help` flag, you might want to generate more comprehensive documentation for:

- Project websites
- README files
- Man pages
- Markdown documentation

## Basic Documentation Generation

You can generate basic documentation by extracting information from your command definitions:

````js
import { cli } from 'gunshi'

// Define your command
const command = {
  name: 'app',
  description: 'My application',
  options: {
    name: {
      type: 'string',
      short: 'n',
      description: 'Name to use'
    },
    verbose: {
      type: 'boolean',
      short: 'v',
      description: 'Enable verbose output'
    }
  },
  usage: {
    examples: '# Example\n$ app --name John'
  },
  run: ctx => {
    // Command implementation
  }
}

// Generate documentation
function generateDocumentation(cmd) {
  let doc = `# ${cmd.name}\n\n`

  if (cmd.description) {
    doc += `${cmd.description}\n\n`
  }

  doc += '## Options\n\n'

  for (const [key, option] of Object.entries(cmd.options || {})) {
    const shortFlag = option.short ? `-${option.short}, ` : ''
    const required = option.required ? ' (required)' : ''
    doc += `- \`${shortFlag}--${key}\`: ${option.description}${required}\n`
  }

  if (cmd.usage?.examples) {
    doc += '\n## Examples\n\n```\n'
    doc += cmd.usage.examples
    doc += '\n```\n'
  }

  return doc
}

// Generate and save documentation
const documentation = generateDocumentation(command)
console.log(documentation)

// You could write this to a file
// require('fs').writeFileSync('docs/app.md', documentation)
````

This would generate documentation like:

```markdown
# app

My application

## Options

- `-n, --name`: Name to use
- `-v, --verbose`: Enable verbose output

## Examples
```

# Example

$ app --name John

```

```

## Documentation for Sub-commands

For CLIs with sub-commands, you can generate documentation for each sub-command:

````js
function generateDocumentation(cmd, subCommands = new Map()) {
  let doc = `# ${cmd.name}\n\n`

  if (cmd.description) {
    doc += `${cmd.description}\n\n`
  }

  // Document options
  if (cmd.options && Object.keys(cmd.options).length > 0) {
    doc += '## Options\n\n'

    for (const [key, option] of Object.entries(cmd.options)) {
      const shortFlag = option.short ? `-${option.short}, ` : ''
      const required = option.required ? ' (required)' : ''
      doc += `- \`${shortFlag}--${key}\`: ${option.description}${required}\n`
    }

    doc += '\n'
  }

  // Document sub-commands
  if (subCommands.size > 0) {
    doc += '## Commands\n\n'

    for (const [name, subCmd] of subCommands.entries()) {
      doc += `### ${name}\n\n`

      if (typeof subCmd === 'function') {
        doc += '*This command is loaded lazily.*\n\n'
      } else {
        if (subCmd.description) {
          doc += `${subCmd.description}\n\n`
        }

        if (subCmd.options && Object.keys(subCmd.options).length > 0) {
          doc += '#### Options\n\n'

          for (const [key, option] of Object.entries(subCmd.options)) {
            const shortFlag = option.short ? `-${option.short}, ` : ''
            const required = option.required ? ' (required)' : ''
            doc += `- \`${shortFlag}--${key}\`: ${option.description}${required}\n`
          }

          doc += '\n'
        }
      }
    }
  }

  // Document examples
  if (cmd.usage?.examples) {
    doc += '## Examples\n\n```\n'
    doc += cmd.usage.examples
    doc += '\n```\n'
  }

  return doc
}
````

## Generating Documentation with Internationalization

If your CLI supports multiple languages, you can generate documentation for each language:

````js
async function generateI18nDocumentation(cmd, locale) {
  // Create a context with the specified locale
  const ctx = {
    locale: new Intl.Locale(locale),
    translation: key => {
      // Simplified translation function for demonstration
      // In a real implementation, you would use your i18n system
      return key
    }
  }

  // Load resources if available
  if (cmd.resource) {
    const resources = await cmd.resource(ctx)

    // Update translation function to use resources
    ctx.translation = key => {
      const keys = key.split('.')
      let value = resources

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k]
        } else {
          return key
        }
      }

      return value
    }
  }

  // Generate documentation using the context
  let doc = `# ${cmd.name}\n\n`

  if (cmd.description) {
    doc += `${ctx.translation('description') || cmd.description}\n\n`
  }

  doc += '## Options\n\n'

  for (const [key, option] of Object.entries(cmd.options || {})) {
    const shortFlag = option.short ? `-${option.short}, ` : ''
    const required = option.required ? ' (required)' : ''
    const description = ctx.translation(`options.${key}`) || option.description
    doc += `- \`${shortFlag}--${key}\`: ${description}${required}\n`
  }

  if (cmd.usage?.examples) {
    doc += '\n## Examples\n\n```\n'
    doc += cmd.usage.examples
    doc += '\n```\n'
  }

  return doc
}

// Generate documentation for multiple locales
async function generateAllDocumentation(cmd) {
  const locales = ['en-US', 'ja-JP']
  const docs = {}

  for (const locale of locales) {
    docs[locale] = await generateI18nDocumentation(cmd, locale)
  }

  return docs
}
````

## Integrating with Documentation Tools

You can integrate Gunshi's documentation generation with popular documentation tools:

### VitePress

For VitePress (which is used for Gunshi's own documentation), you can generate markdown files:

```js
import fs from 'node:fs/promises'
import path from 'node:path'

async function generateVitePressDocumentation(cmd, outputDir) {
  const doc = generateDocumentation(cmd)

  // Ensure the output directory exists
  await fs.mkdir(outputDir, { recursive: true })

  // Write the documentation file
  await fs.writeFile(path.join(outputDir, `${cmd.name}.md`), doc)

  // If there are sub-commands, generate documentation for each
  if (cmd.subCommands && cmd.subCommands.size > 0) {
    const subCommandsDir = path.join(outputDir, 'commands')
    await fs.mkdir(subCommandsDir, { recursive: true })

    for (const [name, subCmd] of cmd.subCommands.entries()) {
      // For lazy-loaded commands, you might need to load them first
      const resolvedCmd = typeof subCmd === 'function' ? await subCmd() : subCmd

      await generateVitePressDocumentation({ ...resolvedCmd, name }, subCommandsDir)
    }
  }
}
```

### Man Pages

You can generate man pages for Unix-like systems:

```js
function generateManPage(cmd) {
  let man = `.TH ${cmd.name.toUpperCase()} 1 "${new Date().toISOString().split('T')[0]}" "v${cmd.version || '1.0.0'}" "${cmd.name} manual"\n`

  man += `.SH NAME\n${cmd.name} - ${cmd.description || ''}\n`

  man += `.SH SYNOPSIS\n.B ${cmd.name}\n`

  for (const [key, option] of Object.entries(cmd.options || {})) {
    const shortFlag = option.short ? `-${option.short}|` : ''
    man += `[${shortFlag}--${key}${option.type === 'boolean' ? '' : ' <value>'}] `
  }

  man += '\n\n.SH DESCRIPTION\n'
  man += cmd.description || ''
  man += '\n\n.SH OPTIONS\n'

  for (const [key, option] of Object.entries(cmd.options || {})) {
    const shortFlag = option.short ? `\\fB-${option.short}\\fR, ` : ''
    man += `.TP\n${shortFlag}\\fB--${key}\\fR\n${option.description || ''}\n`
  }

  if (cmd.usage?.examples) {
    man += '.SH EXAMPLES\n.nf\n'
    man += cmd.usage.examples.replaceAll(/^#.*$/gm, '.B $&')
    man += '\n.fi\n'
  }

  return man
}
```

## Automating Documentation Generation

You can automate documentation generation as part of your build process:

```js
// In your build script
import { cli } from 'gunshi'
import fs from 'node:fs/promises'
import path from 'node:path'

// Import your command definition
import { command } from './src/cli.js'

async function generateDocs() {
  // Generate markdown documentation
  const markdown = generateDocumentation(command)
  await fs.writeFile('docs/cli.md', markdown)

  // Generate man page
  const manPage = generateManPage(command)
  await fs.writeFile('man/cli.1', manPage)

  console.log('Documentation generated successfully!')
}

generateDocs().catch(console.error)
```

## Complete Example

Here's a complete example of a documentation generator for a Gunshi CLI:

```js
import fs from 'node:fs/promises'
import path from 'node:path'
import { cli } from 'gunshi'

// Define your command
const command = {
  name: 'doc-gen',
  description: 'Documentation generator for Gunshi CLIs',
  options: {
    input: {
      type: 'string',
      short: 'i',
      description: 'Input command file',
      required: true
    },
    output: {
      type: 'string',
      short: 'o',
      description: 'Output directory',
      default: 'docs'
    },
    format: {
      type: 'string',
      short: 'f',
      description: 'Output format (markdown, man)',
      default: 'markdown'
    }
  },
  run: async ctx => {
    const { input, output, format } = ctx.values

    // Load the command definition
    const { command: inputCommand } = await import(input)

    // Create output directory
    await fs.mkdir(output, { recursive: true })

    // Generate documentation
    if (format === 'markdown') {
      const doc = generateDocumentation(inputCommand)
      await fs.writeFile(path.join(output, `${inputCommand.name}.md`), doc)
    } else if (format === 'man') {
      const man = generateManPage(inputCommand)
      await fs.writeFile(path.join(output, `${inputCommand.name}.1`), man)
    } else {
      throw new Error(`Unsupported format: ${format}`)
    }

    console.log(`Documentation generated in ${output}`)
  }
}

// Documentation generation function
function generateDocumentation(cmd) {
  // Implementation as shown earlier
}

// Man page generation function
function generateManPage(cmd) {
  // Implementation as shown earlier
}

// Run the CLI
cli(process.argv.slice(2), command)
```

## Next Steps

Now that you understand how to generate documentation for your CLI, you can:

- [Create a translation adapter](/guide/advanced/translation-adapter) for better internationalization support
- [Customize usage generation](/guide/advanced/custom-usage-generation) for more control over help messages
- Explore integrating your documentation with other tools like [JSDoc](https://jsdoc.app/) or [TypeDoc](https://typedoc.org/)
