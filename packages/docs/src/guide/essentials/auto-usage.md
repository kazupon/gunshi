# Auto Usage Generation

Gunshi automatically generates comprehensive usage information for your commands, ensuring your CLI is self-documenting and user-friendly without additional effort.

## How Auto Usage Works

When you define a command with Gunshi, the library automatically:

- Adds `--help` and `-h` flags to every command
- Adds `--version` and `-v` flags when you provide a version in the CLI options
- Generates formatted usage text based on your command configuration
- Displays usage information when users request help, and reports invalid arguments as errors
- Includes descriptions, examples, and type information you provide

The generated usage follows standard CLI conventions, making your application immediately familiar to users.

## Understanding Bracket Notation

Gunshi uses consistent bracket notation throughout the generated usage to indicate whether elements are required or optional:

### Angle Brackets `<>` - Required Elements

Angle brackets indicate elements that must be given:

- `<name>` - The value that an option takes, such as `--name <name>`. It is in angle brackets even when the option has a default, because the value cannot be left out when the option is given. The default is shown as `(default: VALUE)` in the description
- `<positional>` - A required positional argument

The USAGE line spells out each required option (`required: true`) with its value, after `[OPTIONS]`, so that it tells what the command needs:

```sh
USAGE:
  app [OPTIONS] --name <name>

OPTIONS:
  -n, --name <name>    Name to use (required)
```

### Hiding Internal Options

If you need to support options for backward compatibility or internal workflows without showing them in `--help`, set `hidden: true` on the argument schema (or apply the `hidden()` combinator).

The option continues to be accepted and parsed at runtime, but it is omitted from the `OPTIONS` section and usage symbols.

It is left out of the other places a user could discover it, too: shell completion does not offer it and does not complete its value, and the `Did you mean` hint for an unknown option does not suggest it.

### Square Brackets `[]` - Optional Elements

Square brackets indicate optional elements:

- `[OPTIONS]` - The options that can be left out. The USAGE line has it when the command has an option that is not required, such as `--help`
- `[<positional>]` - An optional positional argument
- `[<positional> ...]` - Optional multiple positional arguments
- `[COMMANDS]` - A sub-command, shown when the COMMANDS section lists commands
- `[commandName]` - A default command that runs when no sub-command is specified

Example:

```sh
USAGE:
  app [COMMANDS] [OPTIONS]

COMMANDS:
  [manage]    Default command for managing resources

OPTIONS:
  -t, --type <type>    Resource type (default: standard)
```

This notation provides immediate visual feedback about what users must provide versus what they can omit, making your CLI more intuitive to use.

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!TIP]
> Auto-usage generation is powered by the `@gunshi/plugin-renderer` plugin, which is automatically included when you use the standard `cli()` function. This plugin handles all help text rendering and formatting.

<!-- eslint-enable markdown/no-missing-label-refs -->

## Generated Help Output

Gunshi transforms your command definitions into professional help documentation.

Here's what users see when they request help.

### Basic Command Help

For a simple command with basic configuration (see [Getting Started](./getting-started.md) for implementation details), running with `--help` displays:

```sh
A greeting CLI (greet-cli v1.0.0)

USAGE:
  greet-cli [OPTIONS]

OPTIONS:
  -h, --help                 Display this help message
  -v, --version              Display this version
  -n, --name <name>          Name to greet
  -u, --uppercase            Convert greeting to uppercase
```

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!NOTE]
> The `--help` flag is automatically added - you never need to define it manually.

<!-- eslint-enable markdown/no-missing-label-refs -->

### Help with Arguments and Examples

When your command includes argument definitions and examples (see [Declarative Configuration](./declarative.md) for how to define these), the generated help becomes more comprehensive:

```sh
app (app v1.0.0)

USAGE:
  app [OPTIONS]

OPTIONS:
  -h, --help                           Display this help message
  -v, --version                        Display this version
  -p, --path <path>                    File or directory path to operate on
  -r, --recursive                      Operate recursively on directories
  --no-recursive                       Negate -r, --recursive
  -o, --operation <operation>          Operation to perform: list, copy, move, or delete

EXAMPLES:
  # List files in current directory
  $ app --operation list

  # Copy files recursively
  $ app --operation copy --path ./source --recursive

  # Delete files
  $ app --operation delete --path ./temp
```

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!IMPORTANT]
> A boolean option declared with `negatable: true` also accepts its `--no-` prefixed form, which lets users explicitly disable the flag. The help lists the negated form after the option, as `--no-recursive` above. See [Negatable Boolean Options](./declarative.md#negatable-boolean-options).

<!-- eslint-enable markdown/no-missing-label-refs -->

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
  -h, --help                           [boolean] Display this help message
  -v, --version                        [boolean] Display this version
  -p, --path <path>                    [string]  File or directory path to operate on
  -r, --recursive                      [boolean] Operate recursively on directories
  --no-recursive                       [boolean] Negate -r, --recursive
  -o, --operation <operation>          [string]  Operation to perform: list, copy, move, or delete
```

## Sub-command Help Generation

For CLIs with sub-commands (see [Composable Sub-commands](./composable.md) for implementation), Gunshi generates hierarchical help documentation.

### Main Command Help

When users run the main command with `--help`:

```sh
resource-manager (resource-manager v1.0.0)

USAGE:
  resource-manager [COMMANDS] [OPTIONS]

COMMANDS:
  [manage]                                Manage resources
  create [OPTIONS] --name <name>          Create a new resource
  list [OPTIONS]                          List all resources

For more info, run any command with the `--help` flag:
  resource-manager --help
  resource-manager create --help
  resource-manager list --help

OPTIONS:
  -h, --help             Display this help message
  -v, --version          Display this version
```

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!NOTE]
> The brackets in `[manage]` indicate it's the default command that runs when no sub-command is specified.
> A command that has sub-commands and no `run` has no default command, so it lists only its sub-commands, and it
> prints this usage when it runs without a sub-command. A lazy command has a default command, since its loader returns the
> runner, and so does a function given to `cli()` as the entry.
> Each row describes the arguments that its own command declares, so a command with no options of its own
> has no `[OPTIONS]` next to it, and a required option is spelled out, as in `create [OPTIONS] --name <name>`.

<!-- eslint-enable markdown/no-missing-label-refs -->

### Sub-command Specific Help

Each sub-command has its own help, accessible via `command --help`. The below `create --help`:

```sh
resource-manager (resource-manager v1.0.0)

Create a new resource

USAGE:
  resource-manager create [OPTIONS] --name <name>

OPTIONS:
  -h, --help                 Display this help message
  -v, --version              Display this version
  -n, --name <name>          Name of the resource
  -t, --type <type>          Type of resource (default: default)
```

### Positional Arguments Display

When commands accept positional arguments (arguments without flags), they appear in the `ARGUMENTS` line:

```sh
resource-manager (resource-manager v1.0.0)

Manage resources

USAGE:
  resource-manager manage [OPTIONS] <resource>

ARGUMENTS:
  resource           Type of resource to manage (e.g., user, project)

OPTIONS:
  -h, --help             Display this help message
  -v, --version          Display this version
```

Positional arguments are displayed with clear, descriptive names that indicate their purpose. Required positional arguments use angle brackets (e.g., `<resource>`), while optional positional arguments use square brackets (e.g., `[<query>]`). Multiple positional arguments are shown as `[<file> ...]`, or `<file> [<file> ...]` when at least one value is required.

## Automatic Features

Gunshi provides several automatic features without requiring any configuration:

### Help Flag (`--help`, `-h`)

- Automatically added to all commands
- Displays usage information and exits
- Works at every command level (main and sub-commands)
- Comes before `--version` when both are given

### Version Flag (`--version`, `-v`)

- Automatically added when you provide a `version` in CLI options
- Displays the version and exits
- Available at all command levels

### Negatable Boolean Options

- A boolean option declared with `negatable: true` also accepts its `--no-` prefixed form
- Allows explicit disabling of boolean flags
- The help lists the negated form and describes it, such as `--no-recursive  Negate -r, --recursive`

### Invalid Argument Handling

- When the arguments do not match the command, such as a missing required option, Gunshi prints the errors to stderr and does not run the command
- Each error names the argument, such as `Option '--name' or '-n' is required`
- The usage is not printed with the errors. The command that shows it follows them instead, such as `my-app deploy --help`, or the help of the parent command for an unknown command. See [Errors and Exit Codes](./errors.md#argument-errors)
- With `--help`, the usage is printed instead of the errors, an unknown option of `strict: true` included. An unknown command is still reported

## Key Points

When working with auto-generated usage:

- The `--help` flag is automatically added to all commands - you don't need to define it
- Usage is displayed when users request help, and invalid arguments are reported as errors without the usage
- Descriptions in your `args` configuration become the help text for each option
- The `examples` field accepts both single strings and multi-line strings for multiple examples
- Sub-command help is accessible both from the main help and individually via `command --help`
- The USAGE line shows `[OPTIONS]` for the options that can be left out, and spells out each required option, such as `--name <name>`
- Boolean options declared with `negatable: true` get negated forms (`--no-` prefix), which the help lists and describes
- The `usageOptionType` CLI option adds type annotations to help output

## Next Steps

Learn about the [Plugin System](./plugin-system.md) to extend functionality.
