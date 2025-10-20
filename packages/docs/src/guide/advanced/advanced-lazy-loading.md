# Advanced Lazy Loading and Sub-Commands

This guide explores advanced patterns for implementing lazy loading with sub-commands in Gunshi, based on real-world implementations like [pnpmc](https://github.com/kazupon/pnpmc).

## Why Use Advanced Lazy Loading?

While Gunshi's basic lazy loading (covered in [Lazy & Async](../essentials/lazy-async.md)) is powerful, large CLI applications with many sub-commands can benefit from more advanced patterns:

- **Modular Organization**: Separate commands into independent packages or modules
- **On-Demand Loading**: Load command implementations only when explicitly invoked
- **Reduced Memory Footprint**: Minimize memory usage by loading only what's needed
- **Faster Startup**: Improve CLI startup time by deferring command loading
- **Better Maintainability**: Isolate command implementations for easier maintenance

## Real-World Example: pnpmc Pattern

The [pnpmc](https://github.com/kazupon/pnpmc) project (PNPM Catalogs Tooling) demonstrates an effective pattern for organizing a CLI with lazy-loaded sub-commands:

1. **Bundled Metadata, Lazy-Loaded Implementations**:
   - Command metadata (name, description, arguments) is imported directly and bundled with the main CLI package
   - Only the command runners (implementations) are lazy-loaded when executed
   - This allows displaying help information for all commands without loading implementations

2. **Modular Package Structure**:
   - Command metadata is exposed from separate packages via `meta.js` files and imported directly
   - Command implementations are in separate packages and loaded on-demand
   - This separation enables showing usage via `--help` without loading all command code

3. **Custom Loader Implementation**:
   - A custom loader dynamically imports only the command runners when needed
   - Error handling for module resolution failures

Let's explore how to implement this pattern in your own CLI applications.

## Implementation Pattern

### 1. Project Structure

For a CLI with multiple sub-commands, consider organizing your code like this:

```sh
my-cli/
├── packages/
│   ├── cli/                 # Main CLI package
│   │   ├── src/
│   │   │   ├── commands.ts  # Command definitions
│   │   │   ├── loader.ts    # Custom loader
│   │   │   └── index.ts     # CLI entry point
│   ├── command-a/           # Command A package
│   │   ├── src/
│   │   │   ├── meta.ts      # Command metadata
│   │   │   └── index.ts     # Command implementation
│   └── command-b/           # Command B package
│       ├── src/
│       │   ├── meta.ts      # Command metadata
│       │   └── index.ts     # Command implementation
```

### 2. Command Metadata

Define command metadata in a separate file (e.g., `meta.ts`):

```ts
// packages/command-a/src/meta.ts
export default {
  name: 'command-a',
  description: 'Performs action A',
  args: {
    input: {
      type: 'string',
      short: 'i',
      description: 'Input file'
    },
    output: {
      type: 'string',
      short: 'o',
      description: 'Output file'
    }
  }
}
```

### 3. Command Implementation

Implement the command in a separate file (e.g., `index.ts`):

```ts
// packages/command-a/src/index.ts
import type { CommandContext } from 'gunshi'
import meta from './meta.ts'

export const run = async (ctx: CommandContext<typeof meta.args>) => {
  const { input, output } = ctx.values
  console.log(`Processing ${input} to ${output}`)
  // Command implementation...
}
```

### 4. Custom Loader

Create a custom loader to dynamically import command implementations:

```ts
// packages/cli/src/loader.ts
import type { Args, CommandRunner } from 'gunshi'

export async function load<A extends Args = Args>(pkg: string): Promise<CommandRunner<A>> {
  // Dynamic import of the command package
  try {
    const mod = await import(pkg)
    return mod.default || mod.run
  } catch (error) {
    // Handle module not found errors
    if (isErrorModuleNotFound(error)) {
      console.error(`Command module '${pkg}' not found`)
      return null
    }
    throw error
  }
}

function isErrorModuleNotFound(e: unknown): boolean {
  return (
    e instanceof Error &&
    'code' in e &&
    typeof e.code === 'string' &&
    e.code === 'ERR_MODULE_NOT_FOUND'
  )
}
```

### 5. Command Definitions

Define your commands using Gunshi's `lazy` function and your custom loader:

```ts
// packages/cli/src/commands.ts
import { lazy } from 'gunshi/definition'
import { load } from './loader.ts'

// Import command metadata directly - these are bundled with your CLI
import metaCommandA from 'command-a/meta'
import metaCommandB from 'command-b/meta'

// Create lazy-loaded commands
// Note: Only the implementation (runner) is lazy-loaded, not the metadata
export const commandALazy = lazy(
  // This function is only called when the command is executed
  async () => await load('command-a'),
  // Metadata is provided directly and available immediately
  metaCommandA
)

export const commandBLazy = lazy(async () => await load('command-b'), metaCommandB)

// Create a map of commands
export const commands = new Map()
commands.set(metaCommandA.name, commandALazy)
commands.set(metaCommandB.name, commandBLazy)
```

This approach ensures that:

1. Command metadata is immediately available for generating help text
2. Command implementations are only loaded when the command is actually executed

### 6. CLI Entry Point

Set up your CLI entry point to use the lazy-loaded commands:

```ts
// packages/cli/src/index.ts
import { cli } from 'gunshi'
import { commands, commandALazy } from './commands.ts'

async function main() {
  // Load package.json for version info
  const pkgJsonModule = await import('./package.json', { with: { type: 'json' } })
  const pkgJson = pkgJsonModule.default

  // Run the CLI with lazy-loaded commands
  await cli(process.argv.slice(2), commandALazy, {
    name: 'my-cli',
    version: pkgJson.version,
    description: 'My CLI application',
    subCommands: commands
  })
}

await main()
```

## Advanced Techniques

### On-Demand Sub-Command Loading

For CLIs with many sub-commands, you can implement on-demand sub-command loading:

```ts
// packages/cli/src/commands.ts
import { lazy } from 'gunshi/definition'
import { load } from './loader.ts'

// Function to create a lazy command
function createLazyCommand(name: string) {
  return lazy(
    async () => {
      // Dynamically import metadata and implementation
      const meta = await import(`${name}/meta`).then(m => m.default || m)
      return await load(name)
    },
    { name } // Minimal metadata, rest will be loaded on demand
  )
}

// Create commands map with factory function
export const commands = new Map([
  ['command-a', createLazyCommand('command-a')],
  ['command-b', createLazyCommand('command-b')]
  // Add more commands as needed
])
```

### Package Manager Integration

For CLI tools that integrate with package managers (like pnpmc does with pnpm), you can enhance your loader:

```ts
// packages/cli/src/loader.ts
import { detect, resolveCommand } from 'package-manager-detector'
import { x } from 'tinyexec'
import type { Args, CommandContext, CommandRunner } from 'gunshi'

export async function load<A extends Args = Args>(pkg: string): Promise<CommandRunner<A>> {
  // Detect package manager (npm, yarn, pnpm, etc.)
  const pm = await detect()
  if (pm === null) {
    throw new Error('Fatal Error: Cannot detect package manager')
  }

  // Return a command runner function
  async function runner<A extends Args>(ctx: CommandContext<A>): Promise<void> {
    // Construct the sub-command
    const subCommand = ctx.env.version ? `${pkg}@${ctx.env.version}` : pkg

    // Resolve the command using the package manager
    const resolvedCommand = resolveCommand(pm.agent, 'execute', [subCommand, ...ctx._.slice(1)])
    if (resolvedCommand === null) {
      throw new Error(`Fatal Error: Cannot resolve command '${ctx._[0]}'`)
    }

    // Execute the command
    await x(resolvedCommand.command, resolvedCommand.args, {
      nodeOptions: {
        cwd: ctx.env.cwd,
        stdio: 'inherit',
        env: Object.assign({}, process.env, { CLI_LOADER: 'true' })
      }
    })
  }

  return runner
}
```

## Performance Considerations

When implementing advanced lazy loading, consider these performance optimizations:

1. **Metadata Size**: Keep command metadata small since it's bundled with your CLI
2. **Metadata/Implementation Separation**: Clearly separate what's needed for help text vs. execution
3. **Dependency Management**: Keep implementation dependencies isolated to each command package
4. **Caching**: Cache loaded command implementations to avoid repeated imports
5. **Error Handling**: Implement robust error handling for implementation loading failures
6. **Startup Time**: Measure and optimize CLI startup time by minimizing what's loaded initially

## Type Safety

Maintain type safety with TypeScript when implementing advanced lazy loading:

```ts
// packages/cli/src/commands.ts
import { lazy, define } from 'gunshi/definition'
import type { CommandRunner } from 'gunshi'
import { load } from './loader.ts'

// Define command metadata with type safety
const metaCommandA = define({
  name: 'command-a',
  description: 'Performs action A',
  args: {
    input: {
      type: 'string',
      short: 'i',
      description: 'Input file'
    }
  }
})

// Type for command arguments
type CommandAArgs = NonNullable<typeof metaCommandA.args>

// Create type-safe lazy command
const commandALazy = lazy<CommandAArgs>(async (): Promise<CommandRunner<CommandAArgs>> => {
  return await load<CommandAArgs>('command-a')
}, metaCommandA)
```

## Conclusion

Advanced lazy loading with sub-commands allows you to build scalable, maintainable CLI applications with optimal performance. By bundling command metadata with your main CLI while lazy-loading command implementations, you can create complex CLIs that:

1. Start up quickly with minimal initial loading
2. Display comprehensive help information for all commands
3. Only load command implementations when they're actually executed

The pattern demonstrated by pnpmc provides a solid foundation for organizing your CLI code, which you can adapt and extend to meet your specific requirements.
