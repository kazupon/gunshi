import { cli } from 'gunshi'

// Auto usage generation example
// This demonstrates how gunshi automatically generates usage information

// Define a command with detailed options and descriptions
const command = {
  name: 'file-manager',
  description: 'A file management utility with automatic usage generation',

  // Define various types of options to showcase auto usage generation
  options: {
    // String option with short alias
    path: {
      type: 'string',
      short: 'p',
      description: 'File or directory path'
    },
    // Boolean flag
    recursive: {
      type: 'boolean',
      short: 'r',
      description: 'Operate recursively on directories'
    },
    // Number option with default value
    depth: {
      type: 'number',
      short: 'd',
      default: 1,
      description: 'Maximum depth for recursive operations'
    },
    // Required option
    operation: {
      type: 'string',
      short: 'o',
      required: true,
      description: 'Operation to perform (list, copy, move, delete)'
    },
    // String option with choices (not enforced by args-tokens, but documented)
    format: {
      type: 'string',
      short: 'f',
      description: 'Output format (text, json, csv)'
    }
  },

  // Define usage examples
  usage: {
    examples: `# List files in current directory
$ node index.js --operation list

# Copy files recursively
$ node index.js --operation copy --path ./source --recursive

# Delete files with depth limit
$ node index.js --operation delete --path ./temp --recursive --depth 2

# List files in JSON format
$ node index.js --operation list --format json`
  },

  // Command execution function
  run: ctx => {
    const { operation, path, recursive, depth, format } = ctx.values

    console.log('File Manager')
    console.log('------------')
    console.log(`Operation: ${operation}`)
    console.log(`Path: ${path || 'current directory'}`)
    console.log(`Recursive: ${recursive ? 'Yes' : 'No'}`)

    if (recursive) {
      console.log(`Max Depth: ${depth}`)
    }

    if (format) {
      console.log(`Output Format: ${format}`)
    }

    console.log('\nNote: This is a demo. No actual file operations are performed.')
    console.log('Try running with --help to see the automatically generated usage information.')
  }
}

// Run the command with auto usage generation
cli(process.argv.slice(2), command, {
  name: 'file-manager',
  version: '1.0.0',
  description: 'Example of automatic usage generation',
  // Enable display of option types in usage
  usageOptionType: true
})

// Note: Run this example with --help to see the automatically generated usage information
// $ node index.js --help
