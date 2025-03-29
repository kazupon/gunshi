# Auto Usage Generation

Gunshi automatically generates usage information for your commands, making it easy to provide helpful documentation to users. This feature ensures that your CLI is user-friendly and self-documenting.

## Usage Documentation

Gunshi automatically generates usage information that users can access with the `--help` flag. You can add descriptions to your options and provide examples:

```js
import { cli } from 'gunshi'

const command = {
  name: 'file-manager',
  description: 'A file management utility',

  // Define options with descriptions
  options: {
    path: {
      type: 'string',
      short: 'p',
      description: 'File or directory path to operate on'
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
      description: 'Operation to perform: list, copy, move, or delete'
    }
  },

  // Example commands
  examples: `# List files in current directory
$ app --operation list

# Copy files recursively
$ app --operation copy --path ./source --recursive

# Delete files
$ app --operation delete --path ./temp`,

  run: ctx => {
    // Command implementation
  }
}

await cli(process.argv.slice(2), command, {
  name: 'app',
  version: '1.0.0'
})
```

With this enhanced documentation, the help output will include the examples:

```sh
app (app v1.0.0)

USAGE:
  app <OPTIONS>

OPTIONS:
  -p, --path <path>                    File or directory path to operate on
  -r, --recursive                      Operate recursively on directories
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

## Displaying Option Types

You can enable the display of option types in the usage information:

```js
await cli(process.argv.slice(2), command, {
  name: 'app',
  version: '1.0.0',
  usageOptionType: true
})
```

This will show the data type for each option:

```sh
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
  examples: '$ app create --name my-resource',
  run: ctx => {
    // Command implementation
  }
}

const listCommand = {
  name: 'list',
  description: 'List all resources',
  examples: '$ app list',
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
  name: 'manage',
  description: 'Manage resources',
  run: () => {
    // Main command implementation
  }
}

// Run the CLI with sub-commands
await cli(process.argv.slice(2), mainCommand, {
  name: 'app',
  version: '1.0.0',
  subCommands
})
```

When users run `node app.js --help`, they'll see:

```sh
app (app v1.0.0)

USAGE:
  app [manage] <OPTIONS>
  app <COMMANDS>

COMMANDS:
  create          Create a new resource
  list            List all resources
  manage          Manage resources

For more info, run any command with the `--help` flag:
  app create --help
  app list --help
  app manage --help

OPTIONS:
  -h, --help             Display this help message
  -v, --version          Display this version
```

And when they run `node app.js create --help`, they'll see:

```sh
app (app v1.0.0)

Create a new resource

USAGE:
  app create <OPTIONS>

OPTIONS:
  -n, --name <name>          Name of the resource
  -h, --help                 Display this help message
  -v, --version              Display this version

EXAMPLES:
  $ app create --name my-resource
```
