# Declarative Configuration

Gunshi allows you to configure your commands declaratively, making your CLI code more organized and maintainable.

This approach separates the command definition from its execution logic.

## Basic Declarative Structure

If you've followed the Getting Started guide, you've seen how simple it is to create a basic CLI with Gunshi.

In that guide, we created a simple greeting command. As your CLI grows with more options, validation rules, and features, declarative configuration becomes essential for managing this complexity effectively.

A declaratively configured command in Gunshi follows this structure:

```js
const command = {
  // Command metadata
  name: 'command-name',
  description: 'Command description',

  // Command arguments
  args: {
    // Argument definitions
  },

  // Command examples
  examples: 'Example usage',

  // Command execution function
  run: ctx => {
    // Command implementation
  }
}
```

Let's see how this structure works in practice with a complete example.

## Complete Example

Let's start with a simple example that demonstrates the declarative approach.

We'll build a greeting command with a few basic options:

```js [cli.js]
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
      description: 'Name to greet',
      default: 'World'
    },
    greeting: {
      type: 'string',
      short: 'g',
      default: 'Hello',
      description: 'Greeting to use'
    },
    uppercase: {
      type: 'boolean',
      short: 'u',
      description: 'Display greeting in uppercase'
    }
  },

  // Command examples
  examples: `
# Basic usage with default values
$ node cli.js

# Specify a name
$ node cli.js --name Alice

# Use custom greeting and name
$ node cli.js -n Bob -g "Good morning"

# Display in uppercase
$ node cli.js --name Charlie --uppercase
`,

  // Command execution function
  run: ctx => {
    const { name, greeting, uppercase } = ctx.values

    let message = `${greeting}, ${name}!`

    if (uppercase) {
      message = message.toUpperCase()
    }

    console.log(message)
  }
}

// Run the command with the declarative configuration
await cli(process.argv.slice(2), command, {
  name: 'greet-cli',
  version: '1.0.0',
  description: 'A simple greeting CLI'
})
```

This example demonstrates the key components of declarative configuration:

- **Command metadata** (`name`, `description`) identifies your command
- **Arguments definition** (`args`) specifies what options the command accepts
- **Examples** show users how to use the command
- **Run function** contains the command's execution logic

When you run this command with `--help`, Gunshi automatically generates comprehensive help text from your declarative configuration.

## Command Configuration Options

### Command Metadata

- `name`: The name of the command
- `description`: A description of what the command does

### Additional Command Properties

Since v0.27.0, commands support additional configuration properties:

- `internal`: Boolean flag to mark commands as internal (default: `false`). Internal commands are hidden from help usage but remain fully functional. This is useful for debug commands, administrative functions, or implementation details that shouldn't be exposed to end users.
- `entry`: Boolean flag that marks the main command when subcommands exist (default: `undefined`). This property is typically set automatically by the framework. When used with the `fallbackToEntry` CLI option, it enables fallback behavior for unmatched subcommands.
- `rendering`: Object to customize how the command displays help, usage, and error messages. This allows fine-grained control over command-level rendering output.
  > [!TIP]
  > For detailed information about customizing rendering output including headers, usage text, and validation errors, see the [Rendering Customization guide](../advanced/custom-rendering.md).

### Command Options

Each option can have the following properties:

- `type`: The data type ('string', 'number', 'boolean', 'positional', 'custom'[, 'enum' if supported])
- `short`: A single-character alias for the option (e.g., `-n` as a shorthand for `--name`), making commands quicker to type for frequent use.
  <!-- eslint-disable markdown/no-missing-label-refs -->
  > [!TIP] Multiple boolean short option flags can be grouped together.
  > (e.g., `-Vb` is equivalent to `-V -b`). Options requiring values (like `string`, `number`, `enum`) cannot be part of a group.
  <!-- eslint-enable markdown/no-missing-label-refs -->
- `description`: A description of what the option does
- `default`: Default value if the option is not provided
- `required`: Set to `true` if the option is required (Note: Positional arguments defined with `type: 'positional'` are implicitly required by the parser).
- `multiple`: Set to `true` if multiple option values are allowed
- `toKebab`: Set to `true` to convert camelCase argument names to kebab-case in help text and command-line usage
- `parse`: A function to parse and validate the argument value. Required when `type` is 'custom'
- `conflicts`: Specify mutually exclusive options that cannot be used together

#### Positional Arguments

To define arguments that are identified by their position rather than a name/flag (like `--name`), set their `type` to `'positional'`.

The _key_ you use for the argument in the `args` object serves as its name for accessing the value later.

Here's how you define positional arguments in your command configuration:

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

- **Implicitly Required**: Unlike named options which can be optional, positional arguments must always be provided by the user. When you define an argument with `type: 'positional'` in the schema, Gunshi expects it to be present on the command line. If it's missing, a validation error will occur. They cannot be truly optional like named flags.
- **Order Matters**: Positional arguments are matched based on the order they appear on the command line and the order they are defined in the `args` object.
- **Accessing Values**: The resolved value is accessible via `ctx.values`, using the _key_ you defined in the `args` object (e.g., `ctx.values.source`, `ctx.values.destination`).
- **`ctx.positionals`**: This array still exists and contains the raw string values of positional arguments in the order they were parsed (e.g., `ctx.positionals[0]`, `ctx.positionals[1]`). While available, using `ctx.values.<key>` is generally preferred for clarity and consistency.
- **Descriptions**: The `description` property is used for generating help/usage messages.
- **Type Conversion**: `args-tokens` resolves positional arguments as strings. You typically need to perform type conversions or further validation on the values accessed via `ctx.values.<key>` within your `run` function based on your application's needs.

#### Custom Type Arguments

While the built-in types (`string`, `number`, `boolean`, `positional`) cover most use cases, you may need more complex parsing logic for certain arguments.

Gunshi supports custom argument types with user-defined parsing functions, allowing you to parse structured input like JSON, validate ranges, or integrate with validation libraries like `zod`.

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

By default, argument names are displayed in the help text and used on the command line exactly as they are defined in the `args` object.

However, it's common practice in CLI applications to use kebab-case for multi-word argument names (e.g., `--user-name` instead of `--userName`).

Gunshi supports automatic conversion of camelCase argument names to kebab-case with the `toKebab` property, which can be set at two levels:

1. **Command level**: Apply to all arguments in the command

   To apply kebab-case conversion to all arguments in a command, set the `toKebab` property at the command level:

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

   Alternatively, you can apply kebab-case conversion to specific arguments only by setting it at the argument level:

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

Sometimes you need to explicitly disable a boolean option that might be enabled by default or through configuration files.

Negatable options solve this by providing both positive and negative forms of the same option.

To enable this (e.g., allowing both `--verbose` and `--no-verbose`), add the `negatable: true` property to the option's definition.

- If you define an option like `verbose: { type: 'boolean', negatable: true }`, Gunshi will recognize both `--verbose` and `--no-verbose`.
- If `-V` or `--verbose` is passed, the value will be `true`.
- If `--no-verbose` is passed, the value will be `false`.
- If neither is passed, the value will be `undefined` (unless a `default` is specified).

Without `negatable: true`, only the positive form (e.g., `--verbose`) is recognized, and passing it sets the value to `true`.

The description for the negatable option (e.g., `--no-verbose`) is automatically generated (e.g., "Negatable of --verbose"). You can customize this message using [internationalization resource files](../advanced/internationalization.md) by providing a translation for the specific `arg:no-<optionName>` key (e.g., `arg:no-verbose`).

#### Conflicting Options

You can define mutually exclusive options using the `conflicts` property.

This ensures that conflicting options cannot be used together:

```js
const command = {
  name: 'server',
  description: 'Server configuration',
  args: {
    // These options are mutually exclusive
    verbose: {
      type: 'boolean',
      short: 'v',
      description: 'Enable verbose output',
      conflicts: 'quiet' // Cannot be used with --quiet
    },
    quiet: {
      type: 'boolean',
      short: 'q',
      description: 'Suppress all output',
      conflicts: 'verbose' // Cannot be used with --verbose
    },

    // Multiple conflicts
    development: {
      type: 'boolean',
      description: 'Development mode',
      conflicts: ['production', 'staging'] // Cannot be used with either
    },
    production: {
      type: 'boolean',
      description: 'Production mode',
      conflicts: ['development', 'staging']
    },
    staging: {
      type: 'boolean',
      description: 'Staging mode',
      conflicts: ['development', 'production']
    }
  },
  run: ctx => {
    // Only one of the conflicting options can be true
    if (ctx.values.verbose) {
      console.log('Verbose mode enabled')
    } else if (ctx.values.quiet) {
      // Minimal output
    }
  }
}
```

When conflicting options are used together, Gunshi will throw an error:

- Bidirectional conflict detection works with both long and short option forms
- Clear error messages indicate which options are conflicting
- Helps prevent invalid command configurations

### Examples

The `examples` property provides example commands showing how to use the CLI.

This helps users understand how to use your command correctly and is displayed in the help output.

#### Basic Examples

You can provide examples as a simple string:

```js
const command = {
  name: 'copy',
  description: 'Copy files',
  args: {
    source: {
      type: 'positional',
      description: 'Source file'
    },
    destination: {
      type: 'positional',
      description: 'Destination file'
    },
    recursive: {
      type: 'boolean',
      short: 'r',
      description: 'Copy recursively'
    }
  },
  examples: 'copy file1.txt file2.txt',
  run: ctx => {
    // Implementation
  }
}
```

#### Multiple Examples

For multiple examples, use a multi-line string with clear formatting:

```js
const command = {
  name: 'deploy',
  description: 'Deploy application',
  args: {
    environment: {
      type: 'string',
      short: 'e',
      required: true,
      description: 'Target environment'
    },
    tag: {
      type: 'string',
      short: 't',
      description: 'Version tag'
    },
    dryRun: {
      type: 'boolean',
      description: 'Perform a dry run'
    }
  },
  examples: `
# Deploy to production with a specific tag
deploy --environment production --tag v1.2.3

# Deploy to staging with dry run
deploy -e staging --dry-run

# Deploy to development (using short option)
deploy -e development

# Deploy with multiple options
deploy --environment production --tag latest --dry-run
  `.trim(),
  run: ctx => {
    // Implementation
  }
}
```

#### Dynamic Examples

You can also provide examples as a function that returns a string.

This is useful when examples need to be generated dynamically or localized:

```js
const command = {
  name: 'serve',
  description: 'Start development server',
  args: {
    port: {
      type: 'number',
      short: 'p',
      default: 3000,
      description: 'Port number'
    },
    host: {
      type: 'string',
      short: 'h',
      default: 'localhost',
      description: 'Host address'
    }
  },
  examples: ctx => {
    // Generate examples dynamically based on context
    const appName = ctx.name || 'serve'
    return `
# Start server with default settings
${appName}

# Start server on custom port
${appName} --port 8080

# Start server on all interfaces
${appName} --host 0.0.0.0 --port 3000

# Using short options
${appName} -h 192.168.1.100 -p 8080
    `.trim()
  },
  run: ctx => {
    console.log(`Server starting on ${ctx.values.host}:${ctx.values.port}`)
  }
}
```

#### Formatted Examples with Descriptions

For better readability, you can include descriptions with your examples:

```js
const command = {
  name: 'git-flow',
  description: 'Git flow commands',
  args: {
    feature: {
      type: 'string',
      description: 'Feature name'
    },
    hotfix: {
      type: 'string',
      description: 'Hotfix name'
    },
    release: {
      type: 'string',
      description: 'Release version'
    }
  },
  examples: `
Examples:
  # Start a new feature
  $ git-flow --feature user-authentication

  # Create a hotfix for production
  $ git-flow --hotfix critical-bug-fix

  # Prepare a new release
  $ git-flow --release 2.0.0

Notes:
  - Feature branches are created from develop
  - Hotfixes are created from master
  - Releases merge into both master and develop
  `.trim(),
  run: ctx => {
    // Implementation
  }
}
```

#### Async Examples

For complex CLIs that need to load examples from external files or generate them based on runtime conditions, you can use async functions.

When using the function form, you can return a Promise for async example generation:

```js
const command = {
  name: 'config',
  description: 'Manage configuration',
  args: {
    set: {
      type: 'string',
      description: 'Set configuration value'
    },
    get: {
      type: 'string',
      description: 'Get configuration value'
    }
  },
  examples: async ctx => {
    // Could load examples from external source
    const examples = await loadExamplesFromFile('config-examples.txt')
    return (
      examples ||
      `
# Set a configuration value
config --set "api.key=abc123"

# Get a configuration value
config --get "api.key"
    `.trim()
    )
  },
  run: ctx => {
    // Implementation
  }
}
```

The examples are displayed when users run the command with `--help` flag, making it easier for them to understand the correct usage.

### Command Execution

The `run` function receives a command context object (`ctx`) with:

- `args`: The command arguments configuration (`ArgSchema` object).
- `values`: An object containing the parsed and validated values for both named options (e.g., `ctx.values.name`) and positional arguments (accessed via their _key_ from the `args` definition, e.g., `ctx.values.file`). Values are properly typed based on their argument definitions - strings, numbers, booleans, or custom parsed types.
- `explicit`: An object that tracks which arguments were explicitly provided by the user. Each property corresponds to an argument name and is `true` if the user explicitly provided it, `false` otherwise. This is useful for distinguishing between default values and user-provided values.
- `positionals`: An array of strings containing the raw values of the arguments identified as positional, in the order they were parsed. Useful if you need the original order, but `ctx.values.<key>` is generally recommended.
- `rest`: An array of strings containing arguments that appear after the `--` separator.
- `_`: The raw argument array passed to the `cli` function (original command line arguments).
- `tokens`: The raw tokens parsed by `args-tokens`.
- `omitted`: A boolean indicating if the command was run without specifying a subcommand name.
- `name`: The name of the _currently executing_ command.
- `description`: The description of the _currently executing_ command.
- `env`: The command environment settings (version, logger, renderers, etc.).
- `callMode`: Command call mode ('entry', 'subCommand', or 'unexpected') indicating how the command was invoked.
- `toKebab`: Boolean indicating whether camelCase argument names should be converted to kebab-case.
- `log`: Function for outputting messages that respects the `usageSilent` setting.
- `extensions`: Command context extensions for plugin functionality (available in v0.27.0+).
- `validationError`: Contains validation errors from argument parsing if any occurred.

#### Tracking Explicitly Provided Arguments

Among the context properties, the `explicit` property deserves special attention as it allows you to determine whether an argument was explicitly provided by the user or if it's using a default value:

```js
const command = {
  name: 'deploy',
  args: {
    environment: {
      type: 'string',
      default: 'development'
    },
    force: {
      type: 'boolean',
      default: false
    }
  },
  run: ctx => {
    // Check if the user explicitly provided the environment
    if (ctx.explicit.environment) {
      console.log(`User specified environment: ${ctx.values.environment}`)
    } else {
      console.log(`Using default environment: ${ctx.values.environment}`)
    }

    // Useful for conditional logic based on user intent
    if (ctx.explicit.force && ctx.values.force) {
      console.log('User explicitly requested force mode')
    }
  }
}
```

This feature is particularly useful for:

- Distinguishing between default values and user-provided values
- Implementing different behavior based on whether a user explicitly set an option
- Validation logic that needs to know if a value was user-provided
- Warning users when they're using default values for critical options

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

Throughout this guide, you've seen how declarative configuration structures your CLI code. This approach provides several key advantages:

1. **Separation of concerns**: As shown in our examples, command definition stays separate from implementation logic
2. **Self-documentation**: The structure itself documents your command's capabilities, automatically generating help text
3. **Maintainability**: Clear structure makes commands easier to understand and modify as requirements change
4. **Consistency**: Enforces uniform patterns across all your commands, from simple to complex

## Next Steps

Now that you understand how to configure commands declaratively, you're ready to explore how Gunshi provides full type safety for your commands.

The next section on [Type Safe](./type-safe.md) will show you how to leverage TypeScript's type system to catch errors at compile time and get excellent IDE support while building your CLI applications.

With declarative configuration as your foundation, adding type safety will make your CLI development even more robust and developer-friendly.
