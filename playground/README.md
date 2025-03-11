# Gunshi Examples

This directory contains examples demonstrating the features of Gunshi, a modern JavaScript command-line library.
Each example is a standalone project with its own `package.json` file

## Examples

### 1. Simple API (`simple`)

Demonstrates how to use Gunshi with the Simple API.

```sh
cd simple
node index.js
```

### 2. Type-Safe Arguments (`type-safe`)

Demonstrates type-safe argument parsing with different option types using TypeScript.

```sh
cd type-safe
npx tsx index.ts --name John --age 30 --verbose
# or if you will use pnpm
# pnpx tsx index.ts --name John --age 30 --verbose
```

### 3. Declarative Configuration (`declarative`)

Demonstrates how to configure commands declaratively.

```sh
cd declarative
node index.js --name World --greeting "Hey there" --times 3
```

### 4. Composable Sub-commands (`composable`)

Demonstrates how to create a CLI with composable sub-commands.

```sh
cd composable
node index.js --help

# Create a resource
node index.js create --name my-resource --type special

# List resources
node index.js list --type special --limit 5

# Delete a resource
node index.js delete --name my-resource --force
```

### 5. Lazy & Async Command Loading (`lazy-async`)

Demonstrates lazy loading and asynchronous execution of commands.

```sh
cd lazy-async
node index.js --help
node index.js lazy --delay 2000
node index.js data --id 2
```

### 6. Auto Usage Generation (`auto-usage`)

Demonstrates automatic usage message generation.

```sh
cd auto-usage
node index.js --help
node index.js --operation list --format json
```

### 7. Custom Usage Generation (`custom-usage`)

Demonstrates customizing the usage message generation.

```sh
cd custom-usage

node index.js --help
node index.js --add "Complete the project" --priority high --due 2023-12-31
```

### 8. Internationalization (`i18n`)

Demonstrates internationalization support.

```sh
cd i18n
node index.js --name John

# Japanese
MY_LOCALE=ja-JP node index.js --name 田中 --formal

# Help in English
node index.js --help

# Help in Japanese
MY_LOCALE=ja-JP node index.js --help
```
