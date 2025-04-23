# Declarative Configuration

Gunshi allows you to configure your commands declaratively, making your CLI code more organized and maintainable. This approach separates the command definition from its execution logic.

## Basic Declarative Structure

A declaratively configured command in Gunshi typically has this structure:

```js
const command = {
  // Command metadata
  name: 'command-name',
  description: 'Command description',

  // Command options
  options: {
    // Option definitions
  },

  // Command examples
  examples: 'Example usage',

  // Command execution function
  run: ctx => {
    // Command implementation
  }
}
```

## Complete Example

Here's a complete example of a command with declarative configuration:

```js
import { cli } from 'gunshi'

// Define a command with declarative configuration
const command = {
  // Command metadata
  name: 'greet',
  description: 'A greeting command with declarative configuration',

  // Command options with descriptions
  options: {
    name: {
      type: 'string',
      short: 'n',
      description: 'Name to greet'
    },
    greeting: {
      type: 'string',
      short: 'g',
      default: 'Hello',
      description: 'Greeting to use (default: "Hello")'
    },
    times: {
      type: 'number',
      short: 't',
      default: 1,
      description: 'Number of times to repeat the greeting (default: 1)'
    },
    verbose: {
      // Added a boolean option for grouping example
      type: 'boolean',
      short: 'V',
      description: 'Enable verbose output'
    },
    banner: {
      // Added another boolean option for grouping example
      type: 'boolean',
      short: 'b',
      description: 'Show banner'
    }
  },

  // Command examples
  examples: `# Examples
$ node index.js --name World
$ node index.js -n World -g "Hey there" -t 3
# Boolean short options can be grouped: -V -b is the same as -Vb
$ node index.js -Vb -n World
`,

  // Command execution function
  run: ctx => {
    const { name = 'World', greeting, times, verbose, banner } = ctx.values // Added banner

    if (banner) {
      // Added check for banner
      console.log('*** GREETING ***')
    }
    if (verbose) {
      console.log('Running in verbose mode...')
      console.log('Context values:', ctx.values)
    }

    // Repeat the greeting the specified number of times
    for (let i = 0; i < times; i++) {
      console.log(`${greeting}, ${name}!`)
    }
  }
}

// Run the command with the declarative configuration
await cli(process.argv.slice(2), command, {
  name: 'declarative-example',
  version: '1.0.0',
  description: 'Example of declarative command configuration'
})
```

## Command Configuration Options

### Command Metadata

- `name`: The name of the command
- `description`: A description of what the command does

### Command Options

Each option can have the following properties:

- `type`: The data type ('string', 'number', 'boolean')
- `short`: A single-character alias for the option. Multiple **boolean** short options can be grouped together (e.g., `-Vb` is equivalent to `-V -b`). Options requiring values (like `string` or `number`) cannot be part of a group.
- `description`: A description of what the option does
- `default`: Default value if the option is not provided
- `required`: Set to `true` if the option is required

### Examples

The `examples` property provides example commands showing how to use the CLI.

### Command Execution

The `run` function receives a command context object (`ctx`) with:

- `options`: The command options configuration
- `values`: The resolved option values
- `_`: The raw arguments is passed from `cli` function
- `positionals`: Positional arguments
- `name`: The command name
- `description`: The command description
- `env`: The command environment

## CLI Configuration

When calling the `cli` function, you can provide additional configuration:

```js
await cli(process.argv.slice(2), command, {
  name: 'app-name',
  version: '1.0.0',
  description: 'Application description'
  // Additional configuration options
})
```

## Benefits of Declarative Configuration

Using declarative configuration offers several advantages:

1. **Separation of concerns**: Command definition is separate from implementation
2. **Self-documentation**: The structure clearly documents the command's capabilities
3. **Maintainability**: Easier to understand and modify
4. **Consistency**: Enforces a consistent structure across commands
