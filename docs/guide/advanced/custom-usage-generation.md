# Custom Usage Generation

Gunshi provides automatic usage generation, but you might want more control over how help messages are displayed. This guide explains how to customize usage generation to match your CLI's style and requirements.

## Why Customize Usage Generation?

Customizing usage generation offers several benefits:

- **Branding**: Match your CLI's help messages to your project's style
- **Clarity**: Organize information in a way that makes sense for your users
- **Flexibility**: Add custom sections or formatting to help messages
- **Consistency**: Ensure help messages follow your organization's standards

## Custom Renderers

Gunshi allows you to customize usage generation by providing custom renderer functions:

- `renderHeader`: Renders the header section of the help message
- `renderUsage`: Renders the usage section of the help message
- `renderValidationErrors`: Renders validation error messages

Each renderer function receives a context object and should return a string or a Promise that resolves to a string.

## Basic Custom Header

Here's how to create a custom header renderer:

```js
import { cli } from 'gunshi'

// Define a custom header renderer
const customHeaderRenderer = ctx => {
  const lines = []

  // Add a fancy header
  lines.push('╔═════════════════════════════════════════╗')
  lines.push(`║ ${ctx.env.name.toUpperCase().padStart(20).padEnd(39)} ║`)
  lines.push('╚═════════════════════════════════════════╝')

  // Add description and version
  if (ctx.env.description) {
    lines.push(ctx.env.description)
  }

  if (ctx.env.version) {
    lines.push(`Version: ${ctx.env.version}`)
  }

  lines.push('')

  // Return the header as a string
  return lines.join('\n')
}

// Define your command
const command = {
  name: 'app',
  description: 'My application',
  options: {
    name: {
      type: 'string',
      short: 'n',
      description: 'Name to use'
    }
  },
  run: ctx => {
    // Command implementation
  }
}

// Run the command with the custom header renderer
cli(process.argv.slice(2), command, {
  name: 'my-app',
  version: '1.0.0',
  description: 'A CLI application with custom usage generation',
  renderHeader: customHeaderRenderer
})
```

When users run `node app.js --help`, they'll see your custom header:

```
╔═════════════════════════════════════════╗
║                 MY-APP                  ║
╚═════════════════════════════════════════╝
A CLI application with custom usage generation
Version: 1.0.0

Usage: my-app [options]

Options:
  -n, --name     Name to use
  -h, --help     Show help
  --version      Show version
```

## Custom Usage Section

You can also customize the usage section:

````js
import { cli } from 'gunshi'

// Define a custom usage renderer
const customUsageRenderer = ctx => {
  const lines = []

  // Add a custom title
  lines.push('COMMAND USAGE')
  lines.push('=============')
  lines.push('')

  // Add basic usage
  lines.push('BASIC USAGE:')
  lines.push(`  $ ${ctx.env.name} [options]`)
  lines.push('')

  // Add options section with custom formatting
  if (ctx.options && Object.keys(ctx.options).length > 0) {
    lines.push('OPTIONS:')

    for (const [key, option] of Object.entries(ctx.options)) {
      const shortFlag = option.short ? `-${option.short}|` : '    '
      const required = option.required ? ' (required)' : ''
      const type = option.type ? ` <${option.type}>` : ''

      // Format the option with custom styling
      lines.push(`  ${shortFlag}--${key}${type}${required}`)
      lines.push(`      ${ctx.translation(key)}`)
      lines.push('')
    }
  }

  // Add examples section with custom formatting
  if (ctx.usage?.examples) {
    lines.push('EXAMPLES:')
    lines.push('```')
    lines.push(ctx.usage.examples)
    lines.push('```')
    lines.push('')
  }

  // Add footer
  lines.push('For more information, visit: https://github.com/kazupon/gunshi')

  return lines.join('\n')
}

// Run the command with the custom usage renderer
cli(process.argv.slice(2), command, {
  name: 'my-app',
  version: '1.0.0',
  description: 'A CLI application with custom usage generation',
  renderUsage: customUsageRenderer
})
````

## Custom Validation Errors

You can also customize how validation errors are displayed:

```js
import { cli } from 'gunshi'

// Define a custom validation errors renderer
const customValidationErrorsRenderer = (ctx, error) => {
  const lines = []

  lines.push('ERROR:')
  lines.push('======')
  lines.push('')

  for (const err of error.errors) {
    lines.push(`• ${err.message}`)
  }

  lines.push('')
  lines.push('Please correct the above errors and try again.')
  lines.push(`Run '${ctx.env.name} --help' for usage information.`)

  return lines.join('\n')
}

// Run the command with the custom validation errors renderer
cli(process.argv.slice(2), command, {
  name: 'my-app',
  version: '1.0.0',
  description: 'A CLI application with custom usage generation',
  renderValidationErrors: customValidationErrorsRenderer
})
```

When users run the command with invalid options, they'll see your custom error message:

```
ERROR:
======

• Option 'name' is required

Please correct the above errors and try again.
Run 'my-app --help' for usage information.
```

## Using Colors

You can use ANSI colors to make your help messages more visually appealing:

```js
import { cli } from 'gunshi'

// Custom validation errors renderer
const customValidationErrorsRenderer = (ctx, error) => {
  const lines = []

  lines.push('❌ ERROR:')
  lines.push('═════════')

  for (const err of error.errors) {
    lines.push(`  • ${err.message}`)
  }

  lines.push('')
  lines.push('Please correct the above errors and try again.')
  lines.push(`Run '${ctx.env.name} --help' for usage information.`)

  return Promise.resolve(lines.join('\n'))
}

// Define a command with required options
const command = {
  name: 'task-manager',
  description: 'A task management utility',
  options: {
    action: {
      type: 'string',
      short: 'a',
      required: true,
      description: 'Action to perform (add, list, remove)'
    },
    name: {
      type: 'string',
      short: 'n',
      description: 'Task name'
    }
  },
  run: ctx => {
    // Command implementation
  }
}

// Run the CLI with the custom validation errors renderer
cli(process.argv.slice(2), command, {
  name: 'task-manager',
  version: '1.0.0',
  description: 'A task management utility',
  renderValidationErrors: customValidationErrorsRenderer
})
```

When users run the command without the required `--action` option, they'll see your custom error message:

```
❌ ERROR:
═════════
  • Missing required option: action

Please correct the above errors and try again.
Run 'task-manager --help' for usage information.
```

## Combining Custom Renderers

You can combine all three custom renderers for a completely customized help experience:

```js
import { cli } from 'gunshi'

// Define a command
const command = {
  name: 'task-manager',
  description: 'A task management utility',
  options: {
    add: {
      type: 'string',
      short: 'a',
      description: 'Add a new task'
    },
    list: {
      type: 'boolean',
      short: 'l',
      description: 'List all tasks'
    },
    complete: {
      type: 'string',
      short: 'c',
      description: 'Mark a task as complete'
    },
    priority: {
      type: 'string',
      short: 'p',
      description: 'Set task priority (low, medium, high)'
    },
    due: {
      type: 'string',
      short: 'd',
      description: 'Set due date in YYYY-MM-DD format'
    }
  },
  usage: {
    examples: `# Add a new task
$ task-manager --add "Complete the project"

# Add a task with priority and due date
$ task-manager --add "Important meeting" --priority high --due 2023-12-31

# List all tasks
$ task-manager --list

# Mark a task as complete
$ task-manager --complete "Complete the project"`
  },
  run: ctx => {
    // Command implementation
  }
}

// Run the CLI with all custom renderers
cli(process.argv.slice(2), command, {
  name: 'task-manager',
  version: '1.0.0',
  description: 'A task management utility',
  renderHeader: customHeaderRenderer,
  renderUsage: customUsageRenderer,
  renderValidationErrors: customValidationErrorsRenderer
})
```

## Using Colors

You can enhance your custom renderers with colors using libraries like [chalk](https://github.com/chalk/chalk) or [kleur](https://github.com/lukeed/kleur):

```js
import { cli } from 'gunshi'
import chalk from 'chalk'

// Custom header renderer with colors
const coloredHeaderRenderer = ctx => {
  const lines = []
  lines.push(chalk.blue('╔═════════════════════════════════════════╗'))
  lines.push(chalk.blue(`║             ${chalk.bold(ctx.env.name.toUpperCase())}                ║`))
  lines.push(chalk.blue('╚═════════════════════════════════════════╝'))

  if (ctx.env.description) {
    lines.push(chalk.white(ctx.env.description))
  }

  if (ctx.env.version) {
    lines.push(chalk.gray(`Version: ${ctx.env.version}`))
  }

  lines.push('')
  return Promise.resolve(lines.join('\n'))
}

// Custom usage renderer with colors
const coloredUsageRenderer = ctx => {
  const lines = []

  lines.push(chalk.yellow.bold('📋 COMMAND USAGE'))
  lines.push(chalk.yellow('═══════════════'))
  lines.push('')

  lines.push(chalk.white.bold('BASIC USAGE:'))
  lines.push(chalk.white(`  $ ${ctx.env.name} [options]`))
  lines.push('')

  if (ctx.options && Object.keys(ctx.options).length > 0) {
    lines.push(chalk.white.bold('OPTIONS:'))

    for (const [key, option] of Object.entries(ctx.options)) {
      const shortFlag = option.short ? chalk.green(`-${option.short}, `) : '    '
      const longFlag = chalk.green(`--${key}`)
      const type = chalk.blue(`[${option.type}]`)
      const required = option.required ? chalk.red(' (required)') : ''

      lines.push(
        `  ${shortFlag}${longFlag.padEnd(15)} ${type.padEnd(10)} ${ctx.translation(key)}${required}`
      )
    }

    lines.push('')
  }

  if (ctx.usage.examples) {
    lines.push(chalk.white.bold('EXAMPLES:'))
    const examples = ctx.usage.examples.split('\n')

    for (const example of examples) {
      if (example.startsWith('#')) {
        lines.push(`  ${chalk.cyan(example)}`)
      } else {
        lines.push(`  ${chalk.white(example)}`)
      }
    }

    lines.push('')
  }

  return Promise.resolve(lines.join('\n'))
}

// Run the CLI with colored renderers
cli(process.argv.slice(2), command, {
  name: 'task-manager',
  version: '1.0.0',
  description: 'A task management utility',
  renderHeader: coloredHeaderRenderer,
  renderUsage: coloredUsageRenderer
})
```

## Renderer Context

The renderer functions receive a context object (`ctx`) with the following properties:

- `env`: Environment information (name, version, description)
- `name`: Command name
- `description`: Command description
- `options`: Command options
- `usage`: Usage information (options, examples)
- `translation`: Translation function
- `locale`: Current locale

You can use these properties to customize the output based on the command's configuration.

## Complete Example

Here's a complete example of a CLI with custom usage generation:

```js
import { cli } from 'gunshi'

// Custom header renderer
const customHeaderRenderer = ctx => {
  const lines = []
  lines.push('╔═════════════════════════════════════════╗')
  lines.push('║             TASK MANAGER                ║')
  lines.push('╚═════════════════════════════════════════╝')

  if (ctx.env.description) {
    lines.push(ctx.env.description)
  }

  if (ctx.env.version) {
    lines.push(`Version: ${ctx.env.version}`)
  }

  lines.push('')
  return Promise.resolve(lines.join('\n'))
}

// Custom usage renderer
const customUsageRenderer = ctx => {
  const lines = []

  // Add a custom title
  lines.push('📋 COMMAND USAGE')
  lines.push('═══════════════')
  lines.push('')

  // Add basic usage
  lines.push('BASIC USAGE:')
  lines.push(`  $ ${ctx.env.name} [options]`)
  lines.push('')

  // Add options section with custom formatting
  if (ctx.options && Object.keys(ctx.options).length > 0) {
    lines.push('OPTIONS:')

    for (const [key, option] of Object.entries(ctx.options)) {
      const shortFlag = option.short ? `-${option.short}, ` : '    '
      const longFlag = `--${key}`
      const type = `[${option.type}]`

      // Format the option with custom styling
      const formattedOption = `  ${shortFlag}${longFlag.padEnd(15)} ${type.padEnd(10)} ${ctx.translation(key)}`
      lines.push(formattedOption)
    }

    lines.push('')
  }

  // Add examples section with custom formatting
  if (ctx.usage.examples) {
    lines.push('EXAMPLES:')
    const examples = ctx.usage.examples.split('\n')

    for (const example of examples) {
      // Add extra indentation to examples
      lines.push(`  ${example}`)
    }

    lines.push('')
  }

  // Add footer
  lines.push('NOTE: This is a demo application with custom usage formatting.')
  lines.push('For more information, visit: https://github.com/kazupon/gunshi')

  return Promise.resolve(lines.join('\n'))
}

// Custom validation errors renderer
const customValidationErrorsRenderer = (ctx, error) => {
  const lines = []

  lines.push('❌ ERROR:')
  lines.push('═════════')

  for (const err of error.errors) {
    lines.push(`  • ${err.message}`)
  }

  lines.push('')
  lines.push('Please correct the above errors and try again.')
  lines.push(`Run '${ctx.env.name} --help' for usage information.`)

  return Promise.resolve(lines.join('\n'))
}

// Define a command
const command = {
  name: 'task-manager',
  description: 'A task management utility with custom usage generation',
  options: {
    add: {
      type: 'string',
      short: 'a',
      description: 'Add a new task with the specified description'
    },
    list: {
      type: 'boolean',
      short: 'l',
      description: 'List all tasks'
    },
    complete: {
      type: 'string',
      short: 'c',
      description: 'Mark a task as complete by ID or description'
    },
    priority: {
      type: 'string',
      short: 'p',
      description: 'Set task priority (low, medium, high)'
    },
    due: {
      type: 'string',
      short: 'd',
      description: 'Set due date in YYYY-MM-DD format'
    }
  },
  usage: {
    examples: `# Add a new task
$ task-manager --add "Complete the project"

# Add a task with priority and due date
$ task-manager --add "Important meeting" --priority high --due 2023-12-31

# List all tasks
$ task-manager --list

# Mark a task as complete
$ task-manager --complete "Complete the project"`
  },
  run: ctx => {
    const { add, list, complete, priority, due } = ctx.values

    if (add) {
      console.log(`Adding task: "${add}"`)
      if (priority) console.log(`Priority: ${priority}`)
      if (due) console.log(`Due date: ${due}`)
    } else if (list) {
      console.log('Listing all tasks...')
    } else if (complete) {
      console.log(`Marking task as complete: "${complete}"`)
    } else {
      console.log('No action specified. Run with --help to see usage information.')
    }
  }
}

// Run the command with custom usage generation
cli(process.argv.slice(2), command, {
  name: 'task-manager',
  version: '1.0.0',
  description: 'A task management utility with custom usage generation',
  // Custom renderers
  renderHeader: customHeaderRenderer,
  renderUsage: customUsageRenderer,
  renderValidationErrors: customValidationErrorsRenderer
})
```

## Next Steps

Now that you understand how to customize usage generation, you can:

- [Generate documentation](/guide/advanced/documentation-generation) for your CLI
- [Create a translation adapter](/guide/advanced/translation-adapter) for better internationalization support
- Explore other ways to enhance your CLI's user experience

// Define a colorful header renderer
const colorfulHeaderRenderer = ctx => {
const lines = []

lines.push(colors.bold(colors.cyan('┌─────────────────────────────────────────┐')))
lines.push(colors.bold(colors.cyan(`│ ${ctx.env.name.toUpperCase().padStart(20).padEnd(39)} │`)))
lines.push(colors.bold(colors.cyan('└─────────────────────────────────────────┘')))

if (ctx.env.description) {
lines.push(colors.yellow(ctx.env.description))
}

if (ctx.env.version) {
lines.push(colors.green(`Version: ${ctx.env.version}`))
}

lines.push('')

return lines.join('\n')
}

// Define a colorful usage renderer
const colorfulUsageRenderer = ctx => {
const lines = []

lines.push(colors.bold(colors.magenta('USAGE:')))
lines.push(`  $ ${colors.cyan(ctx.env.name)} [options]`)
lines.push('')

if (ctx.options && Object.keys(ctx.options).length > 0) {
lines.push(colors.bold(colors.magenta('OPTIONS:')))

    for (const [key, option] of Object.entries(ctx.options)) {
      const shortFlag = option.short ? `-${option.short}, ` : '    '
      const required = option.required ? colors.red(' (required)') : ''

      lines.push(
        `  ${colors.green(shortFlag)}${colors.green(`--${key}`)} ${colors.yellow(ctx.translation(key))}${required}`
      )
    }

    lines.push('')

}

if (ctx.usage?.examples) {
lines.push(colors.bold(colors.magenta('EXAMPLES:')))
lines.push(colors.cyan(ctx.usage.examples))
lines.push('')
}

return lines.join('\n')
}

// Run the command with colorful renderers
cli(process.argv.slice(2), command, {
name: 'my-app',
version: '1.0.0',
description: 'A CLI application with colorful usage generation',
renderHeader: colorfulHeaderRenderer,
renderUsage: colorfulUsageRenderer
})

````

## Conditional Rendering

You can conditionally render different help messages based on the context:

```js
import { cli } from 'gunshi'

// Define a context-aware renderer
const contextAwareRenderer = ctx => {
  const lines = []

  // Check if we're showing help for a specific command
  const isSubCommand = ctx.commandPath && ctx.commandPath.length > 1

  if (isSubCommand) {
    // Render help for a sub-command
    const commandName = ctx.commandPath.at(-1)
    lines.push(`Help for sub-command: ${commandName}`)
  } else {
    // Render help for the main command
    lines.push('Help for main command')
  }

  // Add common sections
  lines.push('')
  lines.push('USAGE:')

  if (isSubCommand) {
    lines.push(`  $ ${ctx.env.name} ${ctx.commandPath.join(' ')} [options]`)
  } else {
    lines.push(`  $ ${ctx.env.name} [command] [options]`)
  }

  lines.push('')

  // Add options
  if (ctx.options && Object.keys(ctx.options).length > 0) {
    lines.push('OPTIONS:')

    for (const [key, option] of Object.entries(ctx.options)) {
      const shortFlag = option.short ? `-${option.short}, ` : '    '
      lines.push(`  ${shortFlag}--${key}  ${ctx.translation(key)}`)
    }

    lines.push('')
  }

  // Add available commands if this is the main command
  if (!isSubCommand && ctx.env.subCommands && ctx.env.subCommands.size > 0) {
    lines.push('COMMANDS:')

    for (const [name, command] of ctx.env.subCommands.entries()) {
      const description =
        typeof command === 'function' ? 'Lazy-loaded command' : command.description || ''

      lines.push(`  ${name.padEnd(15)} ${description}`)
    }

    lines.push('')
    lines.push(`Run '${ctx.env.name} [command] --help' for more information on a command.`)
  }

  return lines.join('\n')
}

// Run the command with the context-aware renderer
cli(process.argv.slice(2), mainCommand, {
  name: 'my-app',
  version: '1.0.0',
  subCommands,
  renderUsage: contextAwareRenderer
})
````

## Internationalized Renderers

You can create renderers that support multiple languages:

```js
import { cli } from 'gunshi'

// Define an internationalized renderer
const i18nRenderer = ctx => {
  const lines = []

  // Translate section titles based on locale
  const titles = {
    usage: ctx.translation('titles.usage', 'USAGE'),
    options: ctx.translation('titles.options', 'OPTIONS'),
    examples: ctx.translation('titles.examples', 'EXAMPLES')
  }

  // Add usage section
  lines.push(titles.usage)
  lines.push(`  $ ${ctx.env.name} [options]`)
  lines.push('')

  // Add options section
  if (ctx.options && Object.keys(ctx.options).length > 0) {
    lines.push(titles.options)

    for (const [key, option] of Object.entries(ctx.options)) {
      const shortFlag = option.short ? `-${option.short}, ` : '    '
      lines.push(`  ${shortFlag}--${key}  ${ctx.translation(key)}`)
    }

    lines.push('')
  }

  // Add examples section
  if (ctx.usage?.examples) {
    lines.push(titles.examples)
    lines.push(ctx.usage.examples)
    lines.push('')
  }

  return lines.join('\n')
}

// Run the command with the internationalized renderer
cli(process.argv.slice(2), command, {
  name: 'i18n-app',
  version: '1.0.0',
  description: ctx => ctx.translation('description'),
  locale: new Intl.Locale(process.env.MY_LOCALE || 'en-US'),
  renderUsage: i18nRenderer
})
```

## Next Steps

Now that you understand how to customize usage generation, you can:

- [Generate documentation](/guide/advanced/documentation-generation) for your CLI
- [Create a translation adapter](/guide/advanced/translation-adapter) for better internationalization support
- Explore other ways to enhance your CLI's user experience

```

```
