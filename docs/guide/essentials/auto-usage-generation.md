# Auto Usage Generation

Gunshi automatically generates usage information for your commands, making it easy to provide helpful documentation to users. This feature ensures that your CLI is user-friendly and self-documenting.

## Default Usage Information

When you define a command with options and descriptions, Gunshi automatically generates usage information that users can access with the `--help` flag:

```js
import { cli } from 'gunshi'

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
  run: ctx => {
    // Command implementation
  }
}

cli(process.argv.slice(2), command)
```

When users run `node app.js --help`, they'll see output like:

```
app

My application

Options:
  -n, --name      Name to use
  -v, --verbose   Enable verbose output
  -h, --help      Show help
  --version       Show version
```

## Enhanced Usage Documentation

You can provide more detailed usage documentation by adding a `usage` object to your command:

```js
import { cli } from 'gunshi'

const command = {
  name: 'file-manager',
  description: 'A file management utility',

  // Define options
  options: {
    path: {
      type: 'string',
      short: 'p',
      description: 'File or directory path'
    },
    recursive: {
      type: 'boolean',
      short: 'r',
      description: 'Operate recursively on directories'
    },
    operation: {
      type: 'string',
      short: 'o',
      required: true,
      description: 'Operation to perform (list, copy, move, delete)'
    }
  },

  // Enhanced usage documentation
  usage: {
    // Option descriptions (can be more detailed than the short descriptions)
    options: {
      path: 'File or directory path to operate on',
      recursive: 'Operate recursively on directories',
      operation: 'Operation to perform: list, copy, move, or delete'
    },

    // Example commands
    examples: `# List files in current directory
$ app --operation list

# Copy files recursively
$ app --operation copy --path ./source --recursive

# Delete files
$ app --operation delete --path ./temp`
  },

  run: ctx => {
    // Command implementation
  }
}

cli(process.argv.slice(2), command, {
  name: 'app',
  version: '1.0.0'
})
```

With this enhanced documentation, the help output will include the examples:

```
app v1.0.0

A file management utility

Options:
  -p, --path        File or directory path to operate on
  -r, --recursive   Operate recursively on directories
  -o, --operation   Operation to perform: list, copy, move, or delete (required)
  -h, --help        Show help
  --version         Show version

Examples:
# List files in current directory
$ app --operation list

# Copy files recursively
$ app --operation copy --path ./source --recursive

# Delete files
$ app --operation delete --path ./temp
```

## Displaying Option Types

You can enable the display of option types in the usage information:

```js
cli(process.argv.slice(2), command, {
  name: 'app',
  version: '1.0.0',
  usageOptionType: true
})
```

This will show the data type for each option:

```
Options:
  -p, --path        [string]   File or directory path
  -r, --recursive   [boolean]  Operate recursively
  -o, --operation   [string]   Operation to perform (required)
  -h, --help        [boolean]  Show help
  --version         [boolean]  Show version
```

## Usage for Sub-commands

For CLIs with sub-commands, Gunshi generates appropriate usage information for each sub-command:

```js
import { cli } from 'gunshi'

// Define sub-commands
const createCommand = {
  name: 'create',
  description: 'Create a new resource',
  options: {
    name: {
      type: 'string',
      short: 'n',
      required: true,
      description: 'Name of the resource'
    }
  },
  usage: {
    examples: '$ app create --name my-resource'
  },
  run: ctx => {
    // Command implementation
  }
}

const listCommand = {
  name: 'list',
  description: 'List all resources',
  usage: {
    examples: '$ app list'
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
  name: 'resource-manager',
  description: 'Manage resources',
  run: () => {
    // Main command implementation
  }
}

// Run the CLI with sub-commands
cli(process.argv.slice(2), mainCommand, {
  name: 'app',
  version: '1.0.0',
  subCommands
})
```

When users run `node app.js --help`, they'll see:

```
app v1.0.0

Manage resources

Commands:
  create   Create a new resource
  list     List all resources

Options:
  -h, --help     Show help
  --version      Show version
```

And when they run `node app.js create --help`, they'll see:

```
app create

Create a new resource

Options:
  -n, --name     Name of the resource (required)
  -h, --help     Show help

Examples:
$ app create --name my-resource
```

## Customizing the Help Flag

You can customize the help flag if needed:

```js
cli(process.argv.slice(2), command, {
  name: 'app',
  version: '1.0.0',
  help: {
    flag: 'help-me',
    short: '?'
  }
})
```

With this configuration, users can access help with `--help-me` or `-?` instead of the default `--help` or `-h`.

## Disabling Auto-generated Help

If you want to handle help manually, you can disable the auto-generated help:

```js
cli(process.argv.slice(2), command, {
  name: 'app',
  version: '1.0.0',
  help: false
})
```

Then you can implement your own help handling:

```js
const command = {
  name: 'app',
  options: {
    help: {
      type: 'boolean',
      short: 'h',
      description: 'Show help'
    }
  },
  run: ctx => {
    if (ctx.values.help) {
      console.log('Custom help message')
      return
    }

    // Normal command execution
  }
}
```

## Complete Example

Here's a complete example of a command with detailed usage documentation:

```js
import { cli } from 'gunshi'

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
      description: 'Operation to perform'
    },
    // String option with choices
    format: {
      type: 'string',
      short: 'f',
      description: 'Output format'
    }
  },

  // Define usage examples
  usage: {
    options: {
      path: 'File or directory path',
      recursive: 'Operate recursively on directories',
      depth: 'Maximum depth for recursive operations',
      operation: 'Operation to perform (list, copy, move, delete)',
      format: 'Output format (text, json, csv)'
    },
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
```

## Benefits of Auto Usage Generation

Auto usage generation provides several benefits:

1. **Consistency**: Ensures a consistent format for help documentation
2. **Completeness**: Automatically includes all options and their descriptions
3. **Maintenance**: Updates automatically when you change your command options
4. **User experience**: Provides users with clear and helpful documentation

## Next Steps

Now that you understand auto usage generation, you can:

- [Explore internationalization](/guide/essentials/internationalization) for multi-language support
- [Customize usage generation](/guide/advanced/custom-usage-generation) for more control over help messages
- [Generate documentation](/guide/advanced/documentation-generation) for your CLI
