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

  // Command arguments with descriptions
  args: {
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
      type: 'boolean',
      short: 'V',
      description: 'Enable verbose output',
      negatable: true // Add this to enable --no-verbose
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

# Using the negatable option
$ node index.js --no-verbose -n World

# Using rest arguments after \`--\` (arguments after \`--\` are not parsed by gunshi)
$ node index.js -n User -- --foo --bar buz
`,

  // Command execution function
  run: ctx => {
    // If 'verbose' is defined with negatable: true:
    // - true if -V or --verbose is passed
    // - false if --no-verbose is passed
    // - undefined if neither is passed (or default value if set)
    const { name = 'World', greeting, times, verbose, banner } = ctx.values // Added banner

    if (banner) {
      // Added check for banner
      console.log('*** GREETING ***')
    }
    if (verbose) {
      console.log('Running in verbose mode...')
      console.log('Context values:', ctx.values)
      console.log('Positional arguments:', ctx.positionals) // Show positionals
    }

    // Repeat the greeting the specified number of times
    for (let i = 0; i < times; i++) {
      console.log(`${greeting}, ${name}!`)
    }

    // Print rest arguments if they exist
    if (ctx.rest.length > 0) {
      console.log('\nRest arguments received:')
      for (const [index, arg] of ctx.rest.entries()) {
        console.log(`  ${index + 1}: ${arg}`)
      }
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
- `short`: A single-character alias for the option.
  <!-- eslint-disable markdown/no-missing-label-refs -->
  > [!TIP] Multiple boolean short options can be grouped together.
  > (e.g., `-Vb` is equivalent to `-V -b`). Options requiring values (like `string`, `number`, `enum`) cannot be part of a group.
  <!-- eslint-enable markdown/no-missing-label-refs -->
- `description`: A description of what the option does
- `default`: Default value if the option is not provided
- `required`: Set to `true` if the option is required

#### Negatable Boolean Options

To enable a negatable version of a boolean option (e.g., allowing both `--verbose` and `--no-verbose`), you need to add the `negatable: true` property to the option's definition.

- If you define an option like `verbose: { type: 'boolean', negatable: true }`, Gunshi will recognize both `--verbose` and `--no-verbose`.
- If `-V` or `--verbose` is passed, the value will be `true`.
- If `--no-verbose` is passed, the value will be `false`.
- If neither is passed, the value will be `undefined` (unless a `default` is specified).

Without `negatable: true`, only the positive form (e.g., `--verbose`) is recognized, and passing it sets the value to `true`.

The description for the negatable option (e.g., `--no-verbose`) is automatically generated (e.g., "Negatable of --verbose"). You can customize this message using [internationalization resource files](../essentials/internationalization.md) by providing a translation for the specific `arg:no-<optionName>` key (e.g., `arg:no-verbose`).

### Examples

The `examples` property provides example commands showing how to use the CLI.

### Command Execution

The `run` function receives a command context object (`ctx`) with:

- `args`: The command arguments configuration
- `values`: The resolved option values
- `positionals`: Positional arguments
- `rest`: Rest arguments (arguments appearing after `--`)
- `_`: The raw arguments is passed from `cli` function
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
