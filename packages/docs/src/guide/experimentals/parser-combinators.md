# Parser Combinators

> [!WARNING]
> Parser Combinators are currently **experimental**. The API may change in future versions.

Parser combinators provide a functional, composable approach to defining type-safe argument schemas in Gunshi. Instead of writing plain object configurations, you can use factory functions that generate schemas with full type inference.

This approach brings several advantages:

- **Composable building blocks**: Combine simple parsers to create complex schemas
- **Type-safe by design**: Full TypeScript type inference without manual annotations
- **Reusable schema groups**: Define common configurations once, use them everywhere
- **Functional programming style**: Chain and compose operations naturally

## Import Paths

Parser combinators are available through two import paths:

```ts
// From the main gunshi package
import { string, integer, boolean, ... } from 'gunshi/combinators'

// Or as a standalone package for minimal bundle size
import { string, integer, boolean, ... } from '@gunshi/combinators'
```

The standalone `@gunshi/combinators` package is ideal when you only need combinator functionality without the full gunshi CLI framework.

> [!NOTE]
> The `@gunshi/combinators` package needs to be installed separately: `npm install @gunshi/combinators`. The `gunshi/combinators` import path is available as part of the main `gunshi` package.

## Traditional vs Combinator Approach

Let's compare the traditional object-based approach with parser combinators to understand the difference:

### Traditional Approach

```ts [traditional.ts]
import { define } from 'gunshi'

const command = define({
  name: 'serve',
  args: {
    host: {
      type: 'string',
      short: 'h',
      description: 'Host to bind',
      default: 'localhost'
    },
    port: {
      type: 'number',
      short: 'p',
      description: 'Port number',
      default: 8080,
      min: 1,
      max: 65535
    },
    verbose: {
      type: 'boolean',
      short: 'v',
      description: 'Enable verbose output'
    }
  },
  run: ctx => {
    // Implementation
  }
})
```

### Combinator Approach

```ts [combinators.ts]
import { define } from 'gunshi'
import { string, integer, boolean, withDefault, short } from 'gunshi/combinators'

const command = define({
  name: 'serve',
  args: {
    host: withDefault(short(string({ description: 'Host to bind' }), 'h'), 'localhost'),
    port: withDefault(
      short(
        integer({
          min: 1,
          max: 65535,
          description: 'Port number'
        }),
        'p'
      ),
      8080
    ),
    verbose: short(boolean({ description: 'Enable verbose output' }), 'v')
  },
  run: ctx => {
    // ctx.values.host is typed as string (non-optional due to withDefault)
    // ctx.values.port is typed as number (non-optional due to withDefault)
    // ctx.values.verbose is typed as boolean | undefined
  }
})
```

The combinator approach offers better composability and type inference, while maintaining the same runtime behavior.

## Base Combinators

Base combinators create the fundamental argument types. Each returns a `CombinatorSchema` that can be used directly or modified with other combinators.

### string()

Creates a string argument parser with optional validation:

```ts [string-example.ts]
import { define } from 'gunshi'
import { string } from 'gunshi/combinators'

const command = define({
  name: 'example',
  args: {
    // Basic string
    name: string(),

    // String with constraints
    username: string({
      minLength: 3,
      maxLength: 20,
      pattern: /^[a-zA-Z0-9_]+$/,
      description: 'Username (alphanumeric and underscore only)'
    }),

    // String with description
    email: string({
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      description: 'Email address'
    })
  },
  run: ctx => {
    console.log(`Name: ${ctx.values.name}`)
    console.log(`Username: ${ctx.values.username}`)
    console.log(`Email: ${ctx.values.email}`)
  }
})
```

### number()

Creates a numeric argument parser with optional range validation:

```ts [number-example.ts]
import { define } from 'gunshi'
import { number } from 'gunshi/combinators'

const command = define({
  name: 'example',
  args: {
    // Any number
    value: number(),

    // Number with range
    percentage: number({
      min: 0,
      max: 100,
      description: 'Percentage value (0-100)'
    })
  },
  run: ctx => {
    console.log(`Value: ${ctx.values.value}`)
    console.log(`Percentage: ${ctx.values.percentage}%`)
  }
})
```

### integer()

Creates an integer-only parser, rejecting decimal values:

```ts [integer-example.ts]
import { define } from 'gunshi'
import { integer } from 'gunshi/combinators'

const command = define({
  name: 'server',
  args: {
    // Port number must be an integer
    port: integer({
      min: 1,
      max: 65535,
      description: 'Server port'
    }),

    // Worker count
    workers: integer({
      min: 1,
      description: 'Number of worker processes'
    })
  },
  run: ctx => {
    console.log(`Starting server on port ${ctx.values.port}`)
    console.log(`Using ${ctx.values.workers} workers`)
  }
})
```

### float()

Creates a floating-point number parser:

```ts [float-example.ts]
import { define } from 'gunshi'
import { float } from 'gunshi/combinators'

const command = define({
  name: 'calculate',
  args: {
    // Accepts decimal values
    rate: float({
      min: 0.0,
      max: 1.0,
      description: 'Interest rate (0.0 to 1.0)'
    }),

    // Scientific notation supported
    threshold: float({
      description: 'Threshold value'
    })
  },
  run: ctx => {
    console.log(`Rate: ${ctx.values.rate}`)
    console.log(`Threshold: ${ctx.values.threshold}`)
  }
})
```

### boolean()

Creates a boolean flag parser:

```ts [boolean-example.ts]
import { define } from 'gunshi'
import { boolean } from 'gunshi/combinators'

const command = define({
  name: 'build',
  args: {
    // Simple boolean flag
    minify: boolean(),

    // Boolean with negatable option
    cache: boolean({
      negatable: true,
      description: 'Enable caching (use --no-cache to disable)'
    })
  },
  run: ctx => {
    if (ctx.values.minify) {
      console.log('Minification enabled')
    }

    // With negatable, can explicitly disable
    if (ctx.values.cache === false) {
      console.log('Cache explicitly disabled')
    }
  }
})
```

### choice()

Creates an enum-like parser with literal type inference. The `choice()` combinator only accepts string values. For numeric or other types, combine with `map()` to transform the parsed string value:

```ts [choice-example.ts]
import { define } from 'gunshi'
import { choice, map } from 'gunshi/combinators'

const command = define({
  name: 'deploy',
  args: {
    // Use 'as const' for literal type inference
    environment: choice(['development', 'staging', 'production'] as const, {
      description: 'Deployment environment'
    }),

    // Map numeric values from string choices
    logLevel: map(
      choice(['0', '1', '2', '3'] as const, {
        description: 'Log level (0=error, 1=warn, 2=info, 3=debug)'
      }),
      v => parseInt(v, 10)
    )
  },
  run: ctx => {
    // ctx.values.environment is typed as 'development' | 'staging' | 'production' | undefined
    console.log(`Deploying to ${ctx.values.environment}`)

    // ctx.values.logLevel is typed as number | undefined
    if (ctx.values.logLevel !== undefined) {
      console.log(`Log level: ${ctx.values.logLevel}`)
    }

    // Type-safe switch statements
    switch (ctx.values.environment) {
      case 'production':
        console.log('Running production checks...')
        break
      case 'staging':
        console.log('Deploying to staging environment')
        break
      case 'development':
        console.log('Deploying to dev environment')
        break
    }
  }
})
```

> [!TIP]
> Always use `as const` with choice arrays to get literal type inference. Without it, TypeScript will infer a general string or number type instead of the specific literal values.

### positional()

Creates a positional argument that can optionally use a parser:

```ts [positional-example.ts]
import { define } from 'gunshi'
import { positional, integer } from 'gunshi/combinators'

const command = define({
  name: 'copy',
  args: {
    // Simple positional argument (string by default)
    source: positional({ description: 'Source file' }),

    // Positional with type parser
    count: positional(integer({ min: 1 }), {
      description: 'Number of copies'
    })
  },
  run: ctx => {
    console.log(`Copying ${ctx.values.source} ${ctx.values.count} times`)
  }
})

// Usage: copy file.txt 3
```

### combinator()

Creates custom parsers for specialized types:

```ts [custom-combinator.ts]
import { define } from 'gunshi'
import { combinator } from 'gunshi/combinators'

const command = define({
  name: 'schedule',
  args: {
    // Parse dates
    date: combinator({
      parse: (value: string) => {
        const date = new Date(value)
        if (isNaN(date.getTime())) {
          throw new Error(`Invalid date: ${value}`)
        }
        return date
      },
      metavar: 'date',
      description: 'Schedule date (YYYY-MM-DD or ISO 8601)'
    }),

    // Parse comma-separated values
    tags: combinator({
      parse: (value: string) => value.split(',').map(s => s.trim()),
      metavar: 'tag1,tag2,...',
      description: 'Comma-separated tags'
    }),

    // Parse JSON
    config: combinator({
      parse: (value: string) => {
        try {
          return JSON.parse(value)
        } catch (e) {
          throw new Error(`Invalid JSON: ${e.message}`)
        }
      },
      metavar: 'json',
      description: 'JSON configuration'
    })
  },
  run: ctx => {
    // ctx.values.date is typed as Date
    // ctx.values.tags is typed as string[]
    // ctx.values.config is typed as any (or use generics for specific types)
    console.log(`Scheduled for ${ctx.values.date?.toISOString()}`)
    console.log(`Tags: ${ctx.values.tags?.join(', ')}`)
  }
})
```

## Modifier Combinators

Modifier combinators wrap base combinators to change their behavior or add constraints.

### required()

Makes an argument mandatory:

```ts [required-example.ts]
import { define } from 'gunshi'
import { string, required } from 'gunshi/combinators'

const command = define({
  name: 'login',
  args: {
    // Username is required
    username: required(string({ description: 'Username' })),

    // Password is optional
    password: string({ description: 'Password (will prompt if not provided)' })
  },
  run: ctx => {
    // ctx.values.username is typed as string (not optional)
    // ctx.values.password is typed as string | undefined
    console.log(`Logging in as ${ctx.values.username}`)
  }
})
```

### unrequired()

Explicitly marks an argument as optional. This is useful when you want to override a `required()` field from a base schema using `extend()`:

```ts [unrequired-example.ts]
import { define } from 'gunshi'
import { string, required, unrequired, extend, args } from 'gunshi/combinators'

// Base schema with required field
const base = args({
  name: required(string())
})

// Override to make it optional in specific context
const relaxed = extend(base, {
  name: unrequired(string())
})

const command = define({
  name: 'example',
  args: relaxed,
  run: ctx => {
    // ctx.values.name is now string | undefined
    console.log(`Name: ${ctx.values.name || 'Anonymous'}`)
  }
})
```

### withDefault()

Provides a default value, making the argument always defined:

```ts [default-example.ts]
import { define } from 'gunshi'
import { string, integer, boolean, withDefault } from 'gunshi/combinators'

const command = define({
  name: 'server',
  args: {
    // Always has a value
    host: withDefault(string(), 'localhost'),
    port: withDefault(integer({ min: 1, max: 65535 }), 3000),
    debug: withDefault(boolean(), false)
  },
  run: ctx => {
    // All values are non-optional due to defaults
    // ctx.values.host is typed as string
    // ctx.values.port is typed as number
    // ctx.values.debug is typed as boolean
    console.log(`Server: ${ctx.values.host}:${ctx.values.port}`)
    if (ctx.values.debug) {
      console.log('Debug mode enabled')
    }
  }
})
```

### short()

Adds a single-character alias:

```ts [short-example.ts]
import { define } from 'gunshi'
import { string, boolean, short } from 'gunshi/combinators'

const command = define({
  name: 'example',
  args: {
    // -v for --verbose
    verbose: short(boolean(), 'v'),

    // -o for --output
    output: short(string({ description: 'Output file' }), 'o')
  },
  run: ctx => {
    if (ctx.values.verbose) {
      console.log('Verbose mode enabled')
    }
  }
})

// Usage: example -v -o result.txt
// Or: example --verbose --output result.txt
```

### describe()

Adds or updates the description of an argument:

```ts [describe-example.ts]
import { define } from 'gunshi'
import { string, required, describe } from 'gunshi/combinators'

const command = define({
  name: 'example',
  args: {
    // Add description to an existing combinator
    file: describe(required(string()), 'Path to the input file'),

    // Override existing description
    output: describe(string({ description: 'Old description' }), 'New description for output file')
  },
  run: ctx => {
    console.log(`Processing ${ctx.values.file}`)
  }
})
```

### multiple()

Allows multiple values for an argument:

```ts [multiple-example.ts]
import { define } from 'gunshi'
import { string, integer, multiple } from 'gunshi/combinators'

const command = define({
  name: 'process',
  args: {
    // Accept multiple files
    files: multiple(string({ description: 'Input files' })),

    // Multiple ports
    ports: multiple(integer({ min: 1, max: 65535 }))
  },
  run: ctx => {
    // ctx.values.files is typed as string[] | undefined
    // ctx.values.ports is typed as number[] | undefined

    if (ctx.values.files) {
      console.log(`Processing ${ctx.values.files.length} files`)
      ctx.values.files.forEach(file => console.log(`  - ${file}`))
    }
  }
})

// Usage: process --files a.txt --files b.txt --ports 8080 --ports 8081
```

### map()

Transforms the parsed value:

```ts [map-example.ts]
import { define } from 'gunshi'
import { string, integer, map } from 'gunshi/combinators'

const command = define({
  name: 'convert',
  args: {
    // Convert to uppercase
    name: map(string(), s => s.toUpperCase()),

    // Transform number to percentage
    fraction: map(integer({ min: 0, max: 100 }), n => n / 100),

    // Parse and transform in one step
    size: map(string(), s => {
      const match = s.match(/^(\d+)(K|M|G)?$/i)
      if (!match) throw new Error('Invalid size format')

      const num = parseInt(match[1])
      const unit = match[2]?.toUpperCase()

      switch (unit) {
        case 'K':
          return num * 1024
        case 'M':
          return num * 1024 * 1024
        case 'G':
          return num * 1024 * 1024 * 1024
        default:
          return num
      }
    })
  },
  run: ctx => {
    // ctx.values.name is uppercase
    // ctx.values.fraction is between 0 and 1
    // ctx.values.size is in bytes
    console.log(`Name: ${ctx.values.name}`)
    console.log(`Fraction: ${ctx.values.fraction}`)
    console.log(`Size: ${ctx.values.size} bytes`)
  }
})

// Usage: convert --name hello --fraction 50 --size 10M
```

## Schema Composition

Schema composition combinators help you build reusable and maintainable argument configurations.

### args()

Creates a type-safe schema object (identity function at runtime, but preserves types):

```ts [args-example.ts]
import { define } from 'gunshi'
import { args, string, boolean, short } from 'gunshi/combinators'

// Define reusable schema groups
const debugOptions = args({
  verbose: short(boolean(), 'v'),
  debug: boolean(),
  logLevel: string()
})

const networkOptions = args({
  host: string(),
  port: integer(),
  timeout: integer()
})

// Use directly in command definition
const command = define({
  name: 'example',
  args: debugOptions, // Can use args() result directly
  run: ctx => {
    if (ctx.values.verbose) {
      console.log('Verbose output enabled')
    }
  }
})
```

### merge()

Combines multiple schemas with last-write-wins for conflicts:

```ts [merge-example.ts]
import { define } from 'gunshi'
import { args, merge, string, boolean, integer, withDefault, short } from 'gunshi/combinators'

// Common options used across commands
const common = args({
  verbose: short(boolean(), 'v'),
  quiet: short(boolean(), 'q'),
  config: string({ description: 'Config file path' })
})

// Network-related options
const network = args({
  host: withDefault(string(), 'localhost'),
  port: withDefault(integer({ min: 1, max: 65535 }), 8080),
  secure: boolean()
})

// Database options
const database = args({
  dbHost: withDefault(string(), 'localhost'),
  dbPort: withDefault(integer(), 5432),
  dbName: required(string())
})

// Compose different combinations for different commands
const serverCommand = define({
  name: 'server',
  args: merge(common, network),
  run: ctx => {
    console.log(`Server at ${ctx.values.host}:${ctx.values.port}`)
  }
})

const migrateCommand = define({
  name: 'migrate',
  args: merge(common, database),
  run: ctx => {
    console.log(`Migrating database ${ctx.values.dbName}`)
  }
})

// Merge all for complex commands
const fullCommand = define({
  name: 'full',
  args: merge(
    common,
    network,
    database,
    args({
      // Add command-specific options
      workers: integer({ description: 'Number of workers' })
    })
  ),
  run: ctx => {
    // Has access to all merged options
    console.log('Running with full configuration')
  }
})
```

### extend()

Overrides specific fields in a base schema:

```ts [extend-example.ts]
import { define } from 'gunshi'
import { args, extend, string, integer, boolean, required, withDefault } from 'gunshi/combinators'

// Base configuration
const baseConfig = args({
  name: string(),
  port: withDefault(integer(), 8080),
  debug: boolean()
})

// Production config: make name required, restrict port range
const productionConfig = extend(baseConfig, {
  name: required(string({ description: 'Service name (required)' })),
  port: required(
    integer({
      min: 443,
      max: 443,
      description: 'HTTPS port only'
    })
  ),
  debug: withDefault(boolean(), false) // Debug off by default in production
})

// Development config: relaxed settings
const developmentConfig = extend(baseConfig, {
  port: withDefault(integer({ min: 3000, max: 9999 }), 3000),
  debug: withDefault(boolean(), true) // Debug on by default in development
})

const prodCommand = define({
  name: 'start-prod',
  args: productionConfig,
  run: ctx => {
    // ctx.values.name is required (string)
    // ctx.values.port is required and must be 443
    console.log(`Production service ${ctx.values.name} on port ${ctx.values.port}`)
  }
})

const devCommand = define({
  name: 'start-dev',
  args: developmentConfig,
  run: ctx => {
    // More relaxed requirements for development
    console.log(`Development server on port ${ctx.values.port}`)
  }
})
```

## Complete Example

Here's a comprehensive example showing various combinator features working together:

```ts [cli.ts]
import { cli, define } from 'gunshi'
import {
  args,
  boolean,
  choice,
  combinator,
  extend,
  integer,
  map,
  merge,
  multiple,
  positional,
  required,
  short,
  string,
  withDefault
} from 'gunshi/combinators'

// Define reusable schema groups
const commonOptions = args({
  verbose: short(boolean({ description: 'Verbose output' }), 'v'),
  quiet: short(boolean({ description: 'Suppress output' }), 'q'),
  color: withDefault(choice(['auto', 'always', 'never'] as const), 'auto')
})

const networkOptions = args({
  host: withDefault(string({ description: 'Host to bind' }), '0.0.0.0'),
  port: withDefault(
    integer({
      min: 1,
      max: 65535,
      description: 'Port number'
    }),
    3000
  ),
  secure: boolean({ description: 'Use HTTPS' })
})

// Custom combinator for parsing duration
const duration = combinator({
  parse: (value: string) => {
    const match = value.match(/^(\d+)(ms|s|m|h)$/)
    if (!match) {
      throw new Error('Invalid duration format (use: 100ms, 5s, 2m, 1h)')
    }

    const num = parseInt(match[1])
    const unit = match[2]

    switch (unit) {
      case 'ms':
        return num
      case 's':
        return num * 1000
      case 'm':
        return num * 60 * 1000
      case 'h':
        return num * 60 * 60 * 1000
      default:
        return num
    }
  },
  metavar: '<duration>',
  description: 'Duration (e.g., 100ms, 5s, 2m, 1h)'
})

// Main command definition
const command = define({
  name: 'serve',
  description: 'Start a development server',

  args: merge(
    commonOptions,
    networkOptions,
    args({
      // Additional command-specific options
      entry: required(positional({ description: 'Entry file to serve' })),

      watch: multiple(string({ description: 'Directories to watch' })),

      timeout: withDefault(duration, 30000), // 30 seconds default

      mode: choice(['development', 'production', 'test'] as const, { description: 'Server mode' }),

      headers: map(multiple(string()), headers => {
        // Transform array of "key:value" strings to object
        const result: Record<string, string> = {}
        headers?.forEach(header => {
          const [key, value] = header.split(':')
          if (key && value) {
            result[key.trim()] = value.trim()
          }
        })
        return result
      })
    })
  ),

  run: ctx => {
    const { entry, host, port, secure, verbose, quiet, mode, timeout, watch, headers } = ctx.values

    if (!quiet) {
      console.log(`Starting ${mode || 'development'} server`)
      console.log(`Entry: ${entry}`)
      console.log(`Address: ${secure ? 'https' : 'http'}://${host}:${port}`)
      console.log(`Timeout: ${timeout}ms`)

      if (watch && watch.length > 0) {
        console.log(`Watching: ${watch.join(', ')}`)
      }

      if (headers && Object.keys(headers).length > 0) {
        console.log('Custom headers:')
        Object.entries(headers).forEach(([key, value]) => {
          console.log(`  ${key}: ${value}`)
        })
      }
    }

    if (verbose) {
      console.log('\nFull configuration:')
      console.log(JSON.stringify(ctx.values, null, 2))
    }
  }
})

// Execute the CLI
await cli(process.argv.slice(2), command, {
  name: 'serve-cli',
  version: '1.0.0'
})
```

Usage examples:

```sh
# Basic usage with required entry file
$ serve index.html

# Specify host and port
$ serve index.html --host localhost --port 8080

# Production mode with HTTPS
$ serve dist/index.html --mode production --secure

# Watch multiple directories with custom timeout
$ serve src/index.js --watch src --watch public --timeout 1m

# Add custom headers
$ serve index.html --headers "Cache-Control: no-cache" --headers "X-Custom: value"

# Verbose output
$ serve index.html -v
```

> [!TIP]
> The complete example code is available [here](https://github.com/kazupon/gunshi/tree/main/playground/experimentals/combinators).

## Type Inference

Parser combinators provide excellent TypeScript type inference:

```ts
import { define } from 'gunshi'
import { string, integer, boolean, withDefault, required, multiple } from 'gunshi/combinators'

const command = define({
  name: 'example',
  args: {
    // Type: string | undefined
    optional: string(),

    // Type: string (non-optional due to required)
    mandatory: required(string()),

    // Type: string (non-optional due to withDefault)
    withDef: withDefault(string(), 'default'),

    // Type: string[] | undefined
    multi: multiple(string()),

    // Type: number (non-optional, with constraints)
    port: withDefault(integer({ min: 1, max: 65535 }), 8080)
  },
  run: ctx => {
    // TypeScript knows all the types automatically
    // No manual type annotations needed!
    const { optional, mandatory, withDef, multi, port } = ctx.values
  }
})
```

## Guidelines

When using parser combinators, consider these guidelines:

1. **Start simple**: Begin with base combinators and add modifiers as needed
2. **Compose for reusability**: Create schema groups with `args()` for common option sets
3. **Use `withDefault` for better UX**: Provide sensible defaults to reduce required user input
4. **Leverage type safety**: Let TypeScript infer types rather than adding manual annotations
5. **Custom combinators for domain logic**: Use `combinator()` for specialized parsing needs
6. **Consistent naming**: Use descriptive names for your schema groups
7. **Test compositions**: Verify that merged and extended schemas behave as expected

## Migration from Traditional Approach

If you have existing commands using the traditional object approach, you can gradually migrate to combinators:

```ts
// Before: Traditional approach
const oldCommand = define({
  args: {
    port: {
      type: 'number',
      short: 'p',
      default: 8080,
      min: 1,
      max: 65535,
      description: 'Port number'
    }
  }
})

// After: Combinator approach
import { integer, withDefault, short } from 'gunshi/combinators'

const newCommand = define({
  args: {
    port: withDefault(
      short(
        integer({
          min: 1,
          max: 65535,
          description: 'Port number'
        }),
        'p'
      ),
      8080
    )
  }
})
```

Both approaches are fully compatible and can be mixed within the same application. Choose the approach that best fits your team's preferences and coding style.
