import { cli, define } from 'gunshi'

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
  return lines.join('\n')
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
  if (ctx.args && Object.keys(ctx.args).length > 0) {
    lines.push('OPTIONS:')

    for (const [key, option] of Object.entries(ctx.args)) {
      const shortFlag = option.short ? `-${option.short}, ` : '    '
      const longFlag = `--${key}`
      const type = `[${option.type}]`

      // Format the option with custom styling
      const formattedOption = `  ${shortFlag}${longFlag.padEnd(15)} ${type.padEnd(10)} ${option.description || key}`
      lines.push(formattedOption)
    }

    lines.push('')
  }

  // Add footer
  lines.push('NOTE: This is a demo application with custom usage formatting.')
  lines.push('For more information, visit: https://github.com/kazupon/gunshi')

  return lines.join('\n')
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

  return lines.join('\n')
}

// Define a command
const command = define({
  name: 'task-manager',
  description: 'A task management utility with custom usage generation',
  args: {
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
      if (priority) {
        console.log(`Priority: ${priority}`)
      }
      if (due) {
        console.log(`Due date: ${due}`)
      }
    } else if (list) {
      console.log('Listing all tasks...')
    } else if (complete) {
      console.log(`Marking task as complete: "${complete}"`)
    } else {
      console.log('No action specified. Run with --help to see usage information.')
    }
  }
})

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
