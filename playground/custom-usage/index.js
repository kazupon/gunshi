import { cli } from 'gunshi'

// Custom usage generation example
// This demonstrates how to customize the usage message generation

// Define a command with options
const command = {
  name: 'task-manager',
  description: 'A task management utility with custom usage generation',

  options: {
    add: {
      type: 'string',
      short: 'a'
    },
    list: {
      type: 'boolean',
      short: 'l'
    },
    complete: {
      type: 'string',
      short: 'c'
    },
    priority: {
      type: 'string',
      short: 'p'
    },
    due: {
      type: 'string',
      short: 'd'
    }
  },

  usage: {
    options: {
      add: 'Add a new task with the specified description',
      list: 'List all tasks',
      complete: 'Mark a task as complete by ID or description',
      priority: 'Set task priority (low, medium, high)',
      due: 'Set due date in YYYY-MM-DD format'
    },
    examples: `# Add a new task
$ node index.js --add "Complete the project"

# Add a task with priority and due date
$ node index.js --add "Important meeting" --priority high --due 2023-12-31

# List all tasks
$ node index.js --list

# Mark a task as complete
$ node index.js --complete "Complete the project"`
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

// Note: Run this example with --help to see the custom usage information
// $ node index.js --help
