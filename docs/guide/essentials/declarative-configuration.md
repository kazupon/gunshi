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
    // Add a positional argument using 'file' as the key
    file: {
      type: 'positional',
      description: 'Input file to process'
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
$ node index.js <input-file.txt> --name World

$ node index.js <input-file.txt> -n World -g "Hey there" -t 3

# Boolean short options can be grouped: -V -b is the same as -Vb
$ node index.js <input-file.txt> -Vb -n World

# Using the negatable option
$ node index.js <input-file.txt> --no-verbose -n World

# Using rest arguments after \`--\` (arguments after \`--\` are not parsed by gunshi)
$ node index.js <input-file.txt> -n User -- --foo --bar buz
`, // Added comma here

  // Command execution function
  run: ctx => {
    // If 'verbose' is defined with negatable: true:
    // - true if -V or --verbose is passed
    // - false if --no-verbose is passed
    // - undefined if neither is passed (or default value if set)

    // Access positional argument 'file' via ctx.values.file
    const { name = 'World', greeting, times, verbose, banner, file } = ctx.values

    if (banner) {
      // Added check for banner
      console.log('*** GREETING ***')
    }
    if (verbose) {
      console.log('Running in verbose mode...')
      console.log('Context values:', ctx.values)
      console.log('Input file (from positional via ctx.values.file):', file)
      console.log('Raw positional array (ctx.positionals):', ctx.positionals) // Still available
    }

    // Process the input file (example placeholder)
    console.log(`\nProcessing file: ${file}...`)

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
- `required`: Set to `true` if the option is required (Note: Positional arguments defined with `type: 'positional'` are implicitly required by the parser).

#### Positional Arguments

To define arguments that are identified by their position rather than a name/flag (like `--name`), set their `type` to `'positional'`. The _key_ you use for the argument in the `args` object serves as its name for accessing the value later.

```js
const command = {
  args: {
    // ... other options

    // 'source' is the key and the name used to access the value
    source: {
      type: 'positional',
      description: 'The source file path'
    },

    // 'destination' is the key and the name used to access the value
    destination: {
      type: 'positional',
      description: 'The destination file path'
    }
    // ... potentially more positional arguments
  }
}
```

- **Implicitly Required**: When you define an argument with `type: 'positional'` in the schema, Gunshi (via `args-tokens`) expects it to be present on the command line. If it's missing, a validation error will occur. They cannot be truly optional like named flags.
- **Order Matters**: Positional arguments are matched based on the order they appear on the command line and the order they are defined in the `args` object.
- **Accessing Values**: The resolved value is accessible via `ctx.values`, using the _key_ you defined in the `args` object (e.g., `ctx.values.source`, `ctx.values.destination`).
- **`ctx.positionals`**: This array still exists and contains the raw string values of positional arguments in the order they were parsed (e.g., `ctx.positionals[0]`, `ctx.positionals[1]`). While available, using `ctx.values.<key>` is generally preferred for clarity and consistency.
- **Descriptions**: The `description` property is used for generating help/usage messages.
- **Type Conversion**: `args-tokens` resolves positional arguments as strings. You typically need to perform type conversions or further validation on the values accessed via `ctx.values.<key>` within your `run` function based on your application's needs.

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

- `args`: The command arguments configuration (`ArgSchema` object).
- `values`: An object containing the resolved values for both named options (e.g., `ctx.values.name`) and positional arguments (accessed via their _key_ from the `args` definition, e.g., `ctx.values.file`). Positional values are stored as strings.
- `positionals`: An array of strings containing the raw values of the arguments identified as positional, in the order they were parsed. Useful if you need the original order, but `ctx.values.<key>` is generally recommended.
- `rest`: An array of strings containing arguments that appear after the `--` separator.
- `argv`: The raw argument array passed to the `cli` function.
- `tokens`: The raw tokens parsed by `args-tokens`.
- `omitted`: A boolean indicating if the command was run without specifying a subcommand name.
- `command`: The resolved command definition object itself.
- `cliOptions`: The resolved CLI options passed to `cli`.
- `name`: The name of the _currently executing_ command.
- `description`: The description of the _currently executing_ command.
- `env`: The command environment settings (version, logger, renderers, etc.).
- `log`: Logger function (defaults to `console.log`).

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
