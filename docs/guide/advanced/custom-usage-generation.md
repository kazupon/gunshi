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

Each renderer function receives a command context object and should return a string or a Promise that resolves to a string.

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
await cli(process.argv.slice(2), command, {
  name: 'my-app',
  version: '1.0.0',
  description: 'A CLI application with custom usage generation',
  renderHeader: customHeaderRenderer
})
```

When users run `node app.js --help`, they'll see your custom header:

```sh
╔═════════════════════════════════════════╗
║               MY-APP                    ║
╚═════════════════════════════════════════╝
A CLI application with custom usage generation
Version: 1.0.0


USAGE:
  my-app <OPTIONS>

OPTIONS:
  -n, --name <name>          Name to use
  -h, --help                 Display this help message
  -v, --version              Display this version
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
      lines.push(`      ${ctx.translate(key)}`)
      lines.push('')
    }
  }

  // Add examples section with custom formatting
  if (ctx.examples) {
    lines.push('EXAMPLES:')
    lines.push('```')
    lines.push(ctx.examples)
    lines.push('```')
    lines.push('')
  }

  // Add footer
  lines.push('For more information, visit: https://github.com/kazupon/gunshi')

  return lines.join('\n')
}

// Run the command with the custom usage renderer
await cli(process.argv.slice(2), command, {
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
await cli(process.argv.slice(2), command, {
  name: 'my-app',
  version: '1.0.0',
  description: 'A CLI application with custom usage generation',
  renderValidationErrors: customValidationErrorsRenderer
})
```

When users run the command with invalid options, they'll see your custom error message:

```sh
╔═════════════════════════════════════════╗
║               MY-APP                    ║
╚═════════════════════════════════════════╝
A CLI application with custom usage generation
Version: 1.0.0


ERROR:
======

• Option '--name' or '-n' is required

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
await cli(process.argv.slice(2), command, {
  name: 'task-manager',
  version: '1.0.0',
  description: 'A task management utility',
  renderValidationErrors: customValidationErrorsRenderer
})
```

When users run the command without the required `--action` option, they'll see your custom error message:

```sh
A task management utility (task-manager v1.0.0)

❌ ERROR:
═════════
  • Option '--action' or '-a' is required

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
  examples: `# Add a new task
$ task-manager --add "Complete the project"

# Add a task with priority and due date
$ task-manager --add "Important meeting" --priority high --due 2023-12-31

# List all tasks
$ task-manager --list

# Mark a task as complete
$ task-manager --complete "Complete the project"`,
  run: ctx => {
    // Command implementation
  }
}

// Run the CLI with all custom renderers
await cli(process.argv.slice(2), command, {
  name: 'task-manager',
  version: '1.0.0',
  description: 'A task management utility',
  renderHeader: customHeaderRenderer,
  renderUsage: customUsageRenderer,
  renderValidationErrors: customValidationErrorsRenderer
})
```

## Using Colors

You can enhance your custom renderers with colors using libraries like the belows:

- [chalk](https://github.com/chalk/chalk)
- [kleur](https://github.com/lukeed/kleur):
- [picocolors](https://github.com/alexeyraspopov/picocolors)

The following is an example using chalk:

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
        `  ${shortFlag}${longFlag.padEnd(15)} ${type.padEnd(10)} ${ctx.translate(key)}${required}`
      )
    }

    lines.push('')
  }

  return Promise.resolve(lines.join('\n'))
}

// Run the CLI with colored renderers
await cli(process.argv.slice(2), command, {
  name: 'task-manager',
  version: '1.0.0',
  description: 'A task management utility',
  renderHeader: coloredHeaderRenderer,
  renderUsage: coloredUsageRenderer
})
```

## Command Context on Renderer

The renderer functions receive a command context object (`ctx`) with the following properties:

- `env`: Environment information (name, version, description)
- `name`: Command name
- `description`: Command description
- `options`: Command options
- `examples`: Command examples
- `translate`: Translation function
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
      const formattedOption = `  ${shortFlag}${longFlag.padEnd(15)} ${type.padEnd(10)} ${ctx.translate(key)}`
      lines.push(formattedOption)
    }

    lines.push('')
  }

  // Add examples section with custom formatting
  if (ctx.examples) {
    lines.push('EXAMPLES:')
    const examples = ctx.examples.split('\n')

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
  examples: `# Add a new task
$ task-manager --add "Complete the project"

# Add a task with priority and due date
$ task-manager --add "Important meeting" --priority high --due 2023-12-31

# List all tasks
$ task-manager --list

# Mark a task as complete
$ task-manager --complete "Complete the project"`,
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
await cli(process.argv.slice(2), command, {
  name: 'task-manager',
  version: '1.0.0',
  description: 'A task management utility with custom usage generation',
  // Custom renderers
  renderHeader: customHeaderRenderer,
  renderUsage: customUsageRenderer,
  renderValidationErrors: customValidationErrorsRenderer
})
```
