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
- `multiple`: Set to `true` if the multiple option values are be allowed
- `toKebab`: Set to `true` to convert camelCase argument names to kebab-case in help text and command-line usage
- `parse`: A function to parse and validate the argument value. Required when `type` is 'custom'

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

#### Custom Type Arguments

Gunshi supports custom argument types with user-defined parsing logic. This allows you to create complex argument types that can parse and validate input in any way you need, and a validation library like `zod`.

To define a custom argument type:

```js
import { z } from 'zod'

// custom schema with `zod`
const config = z.object({
  debug: z.boolean(),
  mode: z.string()
})

const command = {
  name: 'example',
  description: 'Example command with custom argument types',
  args: {
    // CSV parser example
    tags: {
      type: 'custom',
      short: 't',
      description: 'Comma-separated list of tags',
      parse: value => value.split(',').map(tag => tag.trim())
    },

    // JSON parser example with `zod`
    config: {
      type: 'custom',
      short: 'c',
      description: 'JSON configuration',
      parse: value => {
        return config.parse(JSON.parse(value))
      }
    },

    // Custom validation example
    port: {
      type: 'custom',
      short: 'p',
      description: 'Port number (1024-65535)',
      parse: value => {
        const port = Number(value)
        if (Number.isNaN(port) || port < 1024 || port > 65_535) {
          throw new TypeError(`Invalid port: ${value}. Must be a number between 1024 and 65535`)
        }
        return port
      }
    }
  },
  run: ctx => {
    // Access the parsed values
    console.log('Tags:', ctx.values.tags) // Array of strings
    console.log('Config:', ctx.values.config) // Parsed JSON object
    console.log('Port:', ctx.values.port) // Validated port number
  }
}
```

Custom type arguments support:

- **Type safety**: The return type of the `parse` function is properly inferred in TypeScript
- **Validation**: Throw an error from the `parse` function to indicate invalid input
- **Default values**: Set a `default` property to provide a value when the argument is not specified
- **Multiple values**: Set `multiple: true` to allow multiple instances of the argument
- **Short aliases**: Set a `short` property to provide a single-character alias

#### Kebab-Case Argument Names

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!TIP]
> This feature is particularly useful for users migrating from the [`cac` library](https://github.com/cacjs/cac), which automatically converts camelCase argument names to kebab-case. If you're transitioning from `cac` to Gunshi, enabling the `toKebab` option will help maintain the same command-line interface for your users.

<!-- eslint-enable markdown/no-missing-label-refs -->

By default, argument names are displayed in the help text and used on the command line exactly as they are defined in the `args` object. However, it's common practice in CLI applications to use kebab-case for multi-word argument names (e.g., `--user-name` instead of `--userName`).

Gunshi supports automatic conversion of camelCase argument names to kebab-case with the `toKebab` property. There are two different `toKebab` properties in Gunshi:

1. **Command-level `toKebab`**: This is a property of the `Command` object itself. When set to `true`, it applies kebab-case conversion to all arguments in the command, unless overridden at the argument level.

2. **Argument-level `toKebab`**: This is a property of the `ArgSchema` object (individual argument definition). It controls kebab-case conversion for a specific argument and takes precedence over the command-level setting.

The `toKebab` property can be set at two levels:

1. **Command level**: Apply to all arguments in the command

   ```js
   const command = {
     name: 'example',
     description: 'Example command',
     toKebab: true, // Apply to all arguments
     args: {
       userName: { type: 'string' }, // Will be displayed as --user-name
       maxRetries: { type: 'number' } // Will be displayed as --max-retries
     },
     run: ctx => {
       /* ... */
     }
   }
   ```

2. **Argument level**: Apply to specific arguments only
   ```js
   const command = {
     name: 'example',
     description: 'Example command',
     args: {
       userName: {
         type: 'string',
         toKebab: true // Will be displayed as --user-name
       },
       maxRetries: { type: 'number' } // Will remain as --maxRetries
     },
     run: ctx => {
       /* ... */
     }
   }
   ```

When `toKebab` is enabled:

- Argument names are converted from camelCase to kebab-case in help text and usage information
- Parameter placeholders are also displayed in kebab-case (e.g., `--user-name <user-name>`)
- Negatable boolean options use kebab-case (e.g., `--no-auto-save` for `autoSave: { type: 'boolean', negatable: true, toKebab: true }`)

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!NOTE]
> The argument values are still accessed using the original camelCase keys in your code (e.g., `ctx.values.userName`), regardless of how they appear on the command line.

<!-- eslint-enable markdown/no-missing-label-refs -->

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
