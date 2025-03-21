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

  // Command usage documentation
  usage: {
    // Usage information
  },

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

  // Command options
  options: {
    name: {
      type: 'string',
      short: 'n'
    },
    greeting: {
      type: 'string',
      short: 'g',
      default: 'Hello'
    },
    times: {
      type: 'number',
      short: 't',
      default: 1
    }
  },

  // Command usage documentation
  usage: {
    options: {
      name: 'Name to greet',
      greeting: 'Greeting to use (default: "Hello")',
      times: 'Number of times to repeat the greeting (default: 1)'
    },
    examples:
      '# Examples\n$ node index.js --name World\n$ node index.js -n World -g "Hey there" -t 3'
  },

  // Command execution function
  run: ctx => {
    const { name = 'World', greeting, times } = ctx.values

    // Repeat the greeting the specified number of times
    for (let i = 0; i < times; i++) {
      console.log(`${greeting}, ${name}!`)
    }
  }
}

// Run the command with the declarative configuration
cli(process.argv.slice(2), command, {
  name: 'declarative-example',
  version: '1.0.0',
  description: 'Example of declarative command configuration'
})
```

## Command Configuration Options

### Command Metadata

- `name`: The name of the command
- `description`: A description of what the command does
- `default`: (Optional) Set to `true` to make this the default command when no sub-command is specified

### Command Options

Each option can have the following properties:

- `type`: The data type ('string', 'number', 'boolean')
- `short`: A single-character alias for the option
- `default`: Default value if the option is not provided
- `required`: Set to `true` if the option is required

### Usage Documentation

The `usage` object helps generate helpful documentation:

- `options`: Descriptions for each option
- `examples`: Example commands showing how to use the CLI

### Command Execution

The `run` function receives a context object (`ctx`) with:

- `values`: The parsed option values
- `positionals`: Positional arguments
- `name`: The command name
- `description`: The command description
- `options`: The command options configuration
- `env`: The command environment

## CLI Configuration

When calling the `cli` function, you can provide additional configuration:

```js
cli(process.argv.slice(2), command, {
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
