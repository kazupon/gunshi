# Lazy & Async Command Loading

> [!NOTE]
> This chapter continues using TypeScript for code examples, building upon the type safety concepts introduced in the [previous chapter](./type-safe.md). While all Gunshi features work with JavaScript, the TypeScript examples provide better IDE support and compile-time checking.

When building CLI applications with many commands or commands that require heavy dependencies, you may encounter slow startup times that frustrate users.

Even simple operations like displaying help text can take seconds if your CLI loads all command implementations upfront.

This guide shows you how to use Gunshi's lazy loading and asynchronous execution features to create fast, responsive CLI applications that only load what they need, when they need it.

## Benefits of Lazy Loading

Lazy loading provides immediate improvements to your CLI application:

- **Faster Startup Time**: Commands are only loaded when actually executed, not when displaying help or running other commands
- **Reduced Memory Usage**: Unexecuted commands and their dependencies stay unloaded, keeping memory footprint minimal
- **Better Code Splitting**: When bundling your CLI, each command can be a separate chunk that loads on demand
- **Improved User Experience**: Users see instant help text and quick responses for simple commands

These benefits become especially valuable as your CLI grows to include dozens or hundreds of commands, each potentially requiring different libraries or complex initialization.

## Basic Lazy Loading

Let's start with a simple example that demonstrates the core concept.

The following code shows how to create a lazy-loaded command that only loads its implementation when executed:

```ts [cli.ts]
import { cli, define, lazy } from 'gunshi'
import type { CommandRunner, CommandContext } from 'gunshi'

// Define the command without command runner separately
const helloDefinition = define({
  name: 'hello',
  description: 'A greeting command',
  args: {
    name: {
      type: 'string',
      description: 'Name to greet',
      default: 'world'
    }
  }
})

// Create a loader function that returns the command implementation
const helloLoader = async (): Promise<CommandRunner> => {
  console.log('Loading hello command runner ...')

  // The actual command runner logic is defined here
  const run = (ctx: CommandContext) => {
    console.log(`Hello, ${ctx.values.name}!`)
  }

  return run // Return the runner function
}

// Combine them using the lazy helper
const lazyHello = lazy(helloLoader, helloDefinition)

// Use the lazy command in your CLI
const subCommands = {
  [lazyHello.commandName]: lazyHello
}

await cli(
  process.argv.slice(2),
  {
    description: 'My CLI application',
    run: () => console.log('Run a sub-command with --help for more info')
  },
  {
    name: 'my-app',
    version: '1.0.0',
    subCommands
  }
)
```

In this example, when a user runs `npx tsx cli.ts --help`, Gunshi displays help text using only the metadata from `helloDefinition`.

The `helloLoader` function is never called.

Only when the user runs `npx tsx cli.ts hello` does Gunshi execute the loader and run the command.

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!TIP]
> The command name is accessed via `commandName` property (not `name`) when using lazy commands. This is because lazy commands are functions, and the `name` property is reserved by the JavaScript runtime.

<!-- eslint-enable markdown/no-missing-label-refs -->

## Dynamic Imports for Code Splitting

For real-world applications, you'll typically want to use dynamic imports to load command implementations from separate files.

This enables bundlers to create separate chunks for each command:

```ts [cli.ts]
import { cli, define, lazy } from 'gunshi'
import type { CommandRunner } from 'gunshi'

// Command metadata stays in the main bundle
const buildDefinition = define({
  name: 'build',
  description: 'Build the project',
  args: {
    watch: {
      type: 'boolean',
      short: 'w',
      description: 'Watch for changes'
    },
    minify: {
      type: 'boolean',
      short: 'm',
      description: 'Minify output'
    }
  }
})

// Loader uses dynamic import to load the command from a separate file
const buildLoader = async (): Promise<CommandRunner> => {
  // This creates a separate chunk in your bundle
  const { run } = await import('./commands/build.ts')
  return run
}

const lazyBuild = lazy(buildLoader, buildDefinition)

// Add more commands following the same pattern
const deployDefinition = define({
  name: 'deploy',
  description: 'Deploy to production',
  args: {
    environment: {
      type: 'string',
      short: 'e',
      default: 'production'
    }
  }
})

const deployLoader = async (): Promise<CommandRunner> => {
  const { run } = await import('./commands/deploy.ts')
  return run
}

const lazyDeploy = lazy(deployLoader, deployDefinition)

// Register all lazy commands
const subCommands = {
  [lazyBuild.commandName]: lazyBuild,
  [lazyDeploy.commandName]: lazyDeploy
}

await cli(
  process.argv.slice(2),
  {
    description: 'Development tools CLI',
    run: () => console.log('Use --help to see available commands')
  },
  {
    name: 'dev-tools',
    version: '2.0.0',
    subCommands
  }
)
```

> [!IMPORTANT]
> The examples above use `.ts` extensions in dynamic import paths (`await import('./commands/build.ts')`). This will work in the following scenarios:
>
> - **During development**: When using TypeScript execution tools like `tsx`, `ts-node`, or Bun's native TypeScript support
> - **Node.js with experimental support**: When running Node.js v22.6.0+ with the `--experimental-strip-types` flag (renamed to `--experimental-transform-types` in v22.7.0+)
>
> **For production builds with TypeScript compilation**:
> TypeScript does NOT rewrite import paths during compilation. If you plan to compile your TypeScript:
>
> - Use `.js` extensions in your source code: `await import('./commands/build.js')`
> - These `.js` imports will correctly resolve to the compiled JavaScript files
> - Alternatively, configure your bundler (rolldown, rollup, esbuild, webpack) to handle `.ts` extensions
>
> For standard JavaScript projects, use `.js` extensions:
>
> ```ts
> const { run } = await import('./commands/build.js')
> ```

With this approach, your bundler (rolldown, rollup, esbuild, webpack, etc.) will automatically create separate chunks for `./commands/build.ts` and `./commands/deploy.ts`. Users only download and parse the code for commands they actually use.

> [!NOTE]
> On Node.js v23.6.0 and newer, type stripping is enabled by default so erasable TypeScript runs without flags; transformations (e.g., `enum`) still require `--experimental-transform-types`.

## Async Command Execution

Gunshi seamlessly supports asynchronous command execution, which is essential for commands that perform I/O operations, network requests, or other async tasks. Building on lazy loading, your command runners can be async functions:

```ts [cli.ts]
import { cli, define, lazy } from 'gunshi'
import type { Command, CommandContext, CommandRunner, GunshiParams } from 'gunshi'

// Mock implementations that simulate async file operations
// These work without requiring actual files on disk
async function readFile(path: string): Promise<string> {
  // Simulate async file read with a small delay
  await new Promise(resolve => setTimeout(resolve, 100))
  return `Sample data from ${path}`
}

async function transform(data: string): Promise<string> {
  // Simulate async data transformation
  await new Promise(resolve => setTimeout(resolve, 150))
  return data.toUpperCase() + '\n[TRANSFORMED]'
}

async function writeFile(path: string, data: string): Promise<void> {
  // Simulate async file write
  await new Promise(resolve => setTimeout(resolve, 100))
  console.log(`  Written to ${path}: "${data}"`)
}

// Alternative: Use real Node.js file operations
// import { readFile as fsReadFile, writeFile as fsWriteFile } from 'node:fs/promises'
//
// async function readFile(path: string): Promise<string> {
//   return await fsReadFile(path, 'utf-8')
// }
//
// async function transform(data: string): Promise<string> {
//   // Your actual transformation logic here
//   return data.toUpperCase()
// }
//
// async function writeFile(path: string, data: string): Promise<void> {
//   await fsWriteFile(path, data, 'utf-8')
// }

const processDataDefinition = define({
  name: 'process',
  description: 'Process data asynchronously',
  args: {
    input: {
      type: 'string',
      short: 'i',
      description: 'Input file path',
      required: true
    },
    output: {
      type: 'string',
      short: 'o',
      description: 'Output file path',
      required: true
    }
  }
})

const processDataLoader = async (): Promise<
  CommandRunner<GunshiParams<{ args: typeof processDataDefinition.args }>>
> => {
  // Return an async runner function
  return async ctx => {
    // TypeScript knows ctx.values has 'input' (string) and 'output' (string)
    const { input, output } = ctx.values

    console.log(`Processing ${input}...`)

    // Simulate async operations
    const data = await readFile(input)
    const processed = await transform(data)
    await writeFile(output, processed)

    console.log(`Successfully processed to ${output}`)
  }
}

const lazyProcess = lazy(processDataLoader, processDataDefinition)

// The CLI handles async execution automatically
const subCommands = {
  [lazyProcess.commandName]: lazyProcess
}

await cli(
  process.argv.slice(2),
  {
    description: 'Data processing CLI',
    run: () => console.log('Use process command to transform data')
  },
  {
    name: 'data-cli',
    version: '1.0.0',
    subCommands
  }
)
```

Gunshi automatically handles the asynchronous execution, including proper error handling and process exit codes.

You don't need any special configuration—just return an async function from your loader.

## Alternative Loader Return Types

While the examples above show loaders returning runner functions, loaders can also return full Command objects.

This is useful when you want to dynamically construct the entire command structure:

```ts [cli.ts]
import { cli, define, lazy } from 'gunshi'

const configLoader = async () => {
  // Simulate loading configuration (in practice, read from file/API)
  const isDebug = process.env.DEBUG === 'true'

  return define({
    description: `Config command (debug: ${isDebug})`,
    args: {
      verbose: {
        type: 'boolean',
        description: isDebug ? 'Verbose output (DEBUG mode)' : 'Verbose output'
      }
    },
    run: ctx => {
      console.log(isDebug ? 'Running in DEBUG mode' : 'Running in normal mode')
      if (ctx.values.verbose) {
        console.log('Verbose:', ctx.values)
      }
    }
  })
}

// Override command meta info with 2nd parameters
const config = lazy(configLoader, {
  name: 'config',
  description: 'Dynamically configured command'
})

await cli(
  process.argv.slice(2),
  { description: 'CLI with dynamic commands', run: () => {} },
  { name: 'my-cli', version: '1.0.0', subCommands: { config } }
)
```

This pattern is particularly useful when command structure depends on runtime configuration or external data sources.

## Performance Considerations

To maximize the benefits of lazy loading:

1. **Keep loaders lightweight**: The loader function itself should be minimal. Put heavy imports and initialization inside the returned runner function or use dynamic imports.

2. **Group related commands**: If multiple commands share dependencies, consider loading them together to avoid redundant imports.

3. **Monitor bundle sizes**: Use your bundler's analysis tools to verify that commands are properly code-split into separate chunks.

4. **Consider startup frequency**: Commands that are frequently used together might benefit from being in the same chunk, while rarely-used commands should definitely be lazy-loaded.

## Next Steps

Now that you understand lazy loading and async execution in Gunshi, you've learned how to optimize your CLI's performance by loading commands only when needed.

You can create fast, responsive CLIs that handle complex asynchronous operations efficiently while keeping startup times minimal.

The next section on [Auto Usage Generation](./auto-usage.md) will show you how Gunshi automatically creates comprehensive help documentation for all your commands—including lazy-loaded ones.

You'll learn how to enhance your CLI's user experience with well-structured usage information, examples, and command descriptions.

With lazy loading keeping your CLI fast and auto-generated usage making it user-friendly, you'll have all the essential tools to build professional command-line applications with Gunshi.
