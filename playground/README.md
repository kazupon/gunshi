# Gunshi Examples

This directory contains examples demonstrating the features of Gunshi, a modern JavaScript command-line library.

## Examples

### 1. Minimal API (`minimal`)

Demonstrates how to use Gunshi with the minimum API.

```bash
cd minimal
npm start
```

### 2. Type-Safe Arguments (`type-safe`)

Demonstrates type-safe argument parsing with different option types.

```bash
cd type-safe
npm start -- --name John --age 30 --verbose
```

### 3. Declarative Configuration (`declarative`)

Demonstrates how to configure commands declaratively.

```bash
cd declarative
npm start -- --name World --greeting "Hey there" --times 3
```

### 4. Composable Sub-commands (`composable`)

Demonstrates how to create a CLI with composable sub-commands.

```bash
# Show help
cd composable
npm start -- --help

# Create a resource
npm start -- create --name my-resource --type special

# List resources
npm start -- list --type special --limit 5

# Delete a resource
npm start -- delete --name my-resource --force
```

### 5. Lazy & Async Command Loading (`lazy-async`)

Demonstrates lazy loading and asynchronous execution of commands.

```bash
cd lazy-async
npm start -- --help
npm start -- lazy --delay 2000
npm start -- data --id 2
```

### 6. Auto Usage Generation (`auto-usage`)

Demonstrates automatic usage message generation.

```bash
cd auto-usage
npm start -- --help
npm start -- --operation list --format json
```

### 7. Custom Usage Generation (`custom-usage`)

Demonstrates customizing the usage message generation.

```bash
cd custom-usage
npm start -- --help
npm start -- --add "Complete the project" --priority high --due 2023-12-31
```

### 8. Internationalization (`i18n`)

Demonstrates internationalization support.

```bash
cd i18n
# English
npm start -- --name John
# Japanese
npm start -- --name 田中 --formal --locale ja-JP
# Help in English
npm start -- --help
# Help in Japanese
npm start -- --help --locale ja-JP
```

## Running the Examples

Each example is a standalone project with its own `package.json` file. To run an example:

1. Navigate to the example directory
2. Run `npm start` with any additional arguments

For example:

```bash
cd minimal
npm start
```

Some examples have additional npm scripts for specific scenarios. Check the `package.json` file in each example directory for details.
