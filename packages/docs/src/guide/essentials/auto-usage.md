# Auto Usage Generation

Gunshi automatically generates comprehensive usage information for your commands, ensuring your CLI is self-documenting and user-friendly without additional effort.

## How Auto Usage Works

When you define a command with Gunshi, the library automatically:

- Adds `--help` and `-h` flags to every command
- Adds `--version` and `-v` flags when you provide a version in the CLI options
- Generates formatted usage text based on your command configuration
- Displays usage information when users request help or provide invalid arguments
- Includes descriptions, examples, and type information you provide

The generated usage follows standard CLI conventions, making your application immediately familiar to users.

## Understanding Bracket Notation

Gunshi uses consistent bracket notation throughout the generated usage to indicate whether elements are required or optional:

### Angle Brackets `<>` - Required Elements

Angle brackets indicate required elements or parameters without default values:

- `<OPTIONS>` - The command has required options (at least one option without a default value)
- `<name>` - An option parameter that must be provided (no default value)
- `<positional>` - A required positional argument

Example:

```sh
USAGE:
  app <OPTIONS>

OPTIONS:
  -n, --name <name>    Name to use (required)
```

### Square Brackets `[]` - Optional Elements

Square brackets indicate optional elements or parameters with default values:

- `[OPTIONS]` - All options have default values (truly optional)
- `[name]` - An option parameter with a default value
- `[COMMANDS]` - Sub-command selection (when multiple commands exist)
- `[commandName]` - A default command that runs when no sub-command is specified

Example:

```sh
USAGE:
  app [COMMANDS] <OPTIONS>

COMMANDS:
  [manage]    Default command for managing resources

OPTIONS:
  -t, --type [type]    Resource type (default: standard)
```

This notation provides immediate visual feedback about what users must provide versus what they can omit, making your CLI more intuitive to use.

> [!TIP]
> Auto-usage generation is powered by the `@gunshi/plugin-renderer` plugin, which is automatically included when you use the standard `cli()` function. This plugin handles all help text rendering and formatting.

## Generated Help Output

Gunshi transforms your command definitions into professional help documentation. Here's what users see when they request help.

### Basic Command Help

For a simple command with basic configuration (see [Getting Started](./getting-started.md) for implementation details), running with `--help` displays:

```sh
A greeting CLI (greet-cli v1.0.0)

USAGE:
  greet-cli <OPTIONS>

OPTIONS:
  -h, --help                 Display this help message
  -v, --version              Display this version
  -n, --name <name>          Name to greet
  -u, --uppercase            Convert greeting to uppercase
```

> [!NOTE]
> The `--help` flag is automatically added - you never need to define it manually.

### Help with Arguments and Examples

When your command includes argument definitions and examples (see [Declarative Configuration](./declarative.md) for how to define these), the generated help becomes more comprehensive:

```sh
app (app v1.0.0)

USAGE:
  app <OPTIONS>

OPTIONS:
  -p, --path <path>                    File or directory path to operate on
  -r, --recursive                      Operate recursively on directories
  --no-recursive                       Negatable of -r, --recursive
  -o, --operation <operation>          Operation to perform: list, copy, move, or delete
  -h, --help                           Display this help message
  -v, --version                        Display this version

EXAMPLES:
  # List files in current directory
  $ app --operation list

  # Copy files recursively
  $ app --operation copy --path ./source --recursive

  # Delete files
  $ app --operation delete --path ./temp
```

> [!IMPORTANT]
> Boolean options automatically receive a negatable version with the `--no-` prefix. This allows users to explicitly disable boolean flags.

## Customizing Help Output

### Displaying Option Types

Enable type display in the usage output to help users understand what value each option expects:

```js
await cli(process.argv.slice(2), command, {
  name: 'app',
  version: '1.0.0',
  usageOptionType: true // Enable type display
})
```

This adds type information to each option:

```sh
OPTIONS:
  -p, --path <path>              [string]   File or directory path to operate on
  -r, --recursive                [boolean]  Operate recursively on directories
  --no-recursive                 [boolean]  Negatable of -r, --recursive
  -o, --operation <operation>    [string]   Operation to perform: list, copy, move, or delete
  -h, --help                     [boolean]  Display this help message
  -v, --version                  [boolean]  Display this version
```

## Sub-command Help Generation

For CLIs with sub-commands (see [Composable Sub-commands](./composable.md) for implementation), Gunshi generates hierarchical help documentation.

### Main Command Help

When users run the main command with `--help`:

```sh
resource-manager (resource-manager v1.0.0)

USAGE:
  resource-manager [COMMANDS] <OPTIONS>

COMMANDS:
  [manage] <OPTIONS>       Manage resources
  create <OPTIONS>         Create a new resource
  list <OPTIONS>           List all resources

For more info, run any command with the `--help` flag:
  resource-manager --help
  resource-manager create --help
  resource-manager list --help

OPTIONS:
  -h, --help             Display this help message
  -v, --version          Display this version
```

> [!NOTE]
> The brackets in `[manage]` indicate it's the default command that runs when no sub-command is specified.

### Sub-command Specific Help

Each sub-command has its own help, accessible via `command --help`. The below `create --help`:

```sh
resource-manager (resource-manager v1.0.0)

Create a new resource

USAGE:
  resource-manager create <OPTIONS>

OPTIONS:
  -h, --help                 Display this help message
  -v, --version              Display this version
  -n, --name <name>          Name of the resource
  -t, --type [type]          Type of resource (default: default)
```

### Positional Arguments Display

When commands accept positional arguments (arguments without flags), they appear in the `ARGUMENTS` line:

```sh
resource-manager (resource-manager v1.0.0)

Manage resources

USAGE:
  resource-manager manage <OPTIONS> <resource>

ARGUMENTS:
  resource           Type of resource to manage (e.g., user, project)

OPTIONS:
  -h, --help             Display this help message
  -v, --version          Display this version
```

Positional arguments are displayed with clear, descriptive names that indicate their purpose. Positional arguments are always shown as required using angle brackets (e.g., `<resource>`) as they do not support default values.

## Automatic Features

Gunshi provides several automatic features without requiring any configuration:

### Help Flag (`--help`, `-h`)

- Automatically added to all commands
- Displays usage information and exits
- Works at every command level (main and sub-commands)

### Version Flag (`--version`, `-v`)

- Automatically added when you provide a `version` in CLI options
- Displays the version and exits
- Available at all command levels

### Negatable Boolean Options

- Boolean options automatically get `--no-` prefixed versions
- Allows explicit disabling of boolean flags
- Example: `--recursive` automatically creates `--no-recursive`

### Invalid Argument Handling

- Usage is automatically displayed when users provide invalid arguments
- Helps users understand what went wrong
- Provides immediate guidance for correct usage

## Key Points

When working with auto-generated usage:

- The `--help` flag is automatically added to all commands - you don't need to define it
- Usage is displayed when users provide invalid arguments or explicitly request help
- Descriptions in your `args` configuration become the help text for each option
- The `examples` field accepts both single strings and multi-line strings for multiple examples
- Sub-command help is accessible both from the main help and individually via `command --help`
- Required options are shown with angle brackets `<option>` in the USAGE line
- Boolean options automatically get negatable versions (`--no-` prefix) when not required
- The `usageOptionType` CLI option adds type annotations to help output

## Next Steps

You've now seen how Gunshi automatically generates comprehensive usage information for your commands. You've learned how the framework transforms your command definitions into professional help documentation, handles bracket notation for required and optional elements, and provides automatic features like help flags and negatable options—all without requiring additional configuration from you.

Now that you understand how auto usage generation makes your CLI self-documenting, you're ready to explore how Gunshi's powerful plugin architecture enables this and other features. The next section on the [Plugin System](./plugin-system.md) will show you how plugins like `@gunshi/plugin-renderer` power the auto usage generation you've just learned about, and how you can create your own plugins to extend your CLI with custom functionality.

With auto usage generation providing the foundation for user-friendly CLIs, understanding the plugin system will give you the tools to customize and extend this behavior, whether you need internationalization support, custom rendering, shell completions, or entirely new capabilities tailored to your specific needs.
