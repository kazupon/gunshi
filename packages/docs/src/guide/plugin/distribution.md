# Plugin Distribution

This guide covers everything you need to know about packaging, publishing, and distributing your Gunshi plugins to npm and JSR (JavaScript Registry).

## Package Structure

### Recommended Directory Structure

A well-organized plugin package should follow this structure:

```
my-gunshi-plugin/
├── src/
│   ├── index.ts          # Main plugin export
│   ├── types.ts          # Type definitions
│   ├── extension.ts      # Extension implementation
│   └── utils.ts          # Utility functions
├── test/
│   ├── plugin.test.ts    # Plugin tests
│   └── fixtures/         # Test fixtures
├── lib/                  # Compiled output (gitignored)
│   ├── index.js
│   ├── index.d.ts
│   └── ...
├── examples/             # Usage examples
│   └── basic.js
├── docs/                 # Additional documentation
│   └── api.md
├── package.json
├── jsr.json             # JSR configuration
├── tsconfig.json
├── README.md
├── LICENSE
└── CHANGELOG.md
```

### Essential Files

#### src/index.ts

Main entry point with proper exports:

```ts
// src/index.ts
import { plugin } from '@gunshi/plugin'
import { pluginId, type PluginId, type MyExtension } from './types'
import { createExtension } from './extension'

// Re-export types for consumers
export { pluginId, type PluginId, type MyExtension } from './types'

// Main plugin factory function
export default function myPlugin(options: MyPluginOptions = {}) {
  return plugin<{}, PluginId, [], MyExtension>({
    id: pluginId,
    name: 'My Gunshi Plugin',
    version: '1.0.0',

    setup(ctx) {
      // Plugin setup logic
      if (options.globalOption) {
        ctx.addGlobalOption('my-option', {
          type: 'string',
          description: 'Custom option'
        })
      }
    },

    extension: createExtension(options)
  })
}

// Optional: Named export for convenience
export const myGunshiPlugin = myPlugin
```

#### src/types.ts

Type definitions for reusability:

```ts
// src/types.ts
export const pluginId = 'mycompany:my-plugin' as const
export type PluginId = typeof pluginId

export interface MyExtension {
  doSomething: () => void
  getValue: () => string
  processData: <T>(data: T) => Promise<T>
}

export interface MyPluginOptions {
  globalOption?: boolean
  baseUrl?: string
  timeout?: number
}
```

## Package Configuration

### package.json

Complete package.json configuration:

```json
{
  "name": "gunshi-plugin-myfeature",
  "version": "1.0.0",
  "description": "MyFeature plugin for Gunshi CLI framework",
  "keywords": ["gunshi", "gunshi-plugin", "cli", "plugin", "myfeature"],
  "author": {
    "name": "Your Name",
    "email": "you@example.com"
  },
  "license": "MIT",
  "homepage": "https://github.com/yourusername/gunshi-plugin-myfeature",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/yourusername/gunshi-plugin-myfeature.git"
  },
  "bugs": {
    "url": "https://github.com/yourusername/gunshi-plugin-myfeature/issues"
  },
  "type": "module",
  "main": "./lib/index.js",
  "module": "./lib/index.js",
  "types": "./lib/index.d.ts",
  "exports": {
    ".": {
      "types": "./lib/index.d.ts",
      "import": "./lib/index.js",
      "require": "./lib/index.js"
    },
    "./package.json": "./package.json"
  },
  "files": ["lib", "README.md", "LICENSE", "CHANGELOG.md"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src",
    "format": "prettier --write src test",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "npm run build && npm run test",
    "release": "npm run build && npm publish"
  },
  "peerDependencies": {
    "@gunshi/plugin": "^0.27.0",
    "gunshi": "^0.27.0"
  },
  "peerDependenciesMeta": {
    "@gunshi/plugin": {
      "optional": true
    },
    "gunshi": {
      "optional": true
    }
  },
  "devDependencies": {
    "@gunshi/plugin": "^0.27.0",
    "@types/node": "^20.0.0",
    "@vitest/coverage-v8": "^1.0.0",
    "eslint": "^8.0.0",
    "gunshi": "^0.27.0",
    "prettier": "^3.0.0",
    "tsup": "^8.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  }
}
```

### jsr.json

Configuration for JSR (JavaScript Registry):

```json
{
  "name": "@yourusername/gunshi-plugin-myfeature",
  "version": "1.0.0",
  "description": "MyFeature plugin for Gunshi CLI framework",
  "exports": "./src/index.ts",
  "publish": {
    "include": ["src/**/*.ts", "README.md", "LICENSE"],
    "exclude": ["src/**/*.test.ts", "src/**/*.spec.ts", "test/**/*"]
  }
}
```

### tsconfig.json

TypeScript configuration:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "bundler",
    "rootDir": "./src",
    "outDir": "./lib",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "lib", "test"]
}
```

## Build Configuration

### Using tsup

Configure tsup for optimal builds:

```ts
// tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false, // Don't minify for better debugging
  external: ['@gunshi/plugin', 'gunshi'],
  noExternal: [
    // Include any dependencies you want bundled
  ],
  platform: 'node',
  target: 'node18',
  shims: false
})
```

### Using TypeScript Compiler

Alternative build with tsc:

```json
// package.json scripts
{
  "scripts": {
    "build": "tsc",
    "build:watch": "tsc --watch"
  }
}
```

## Naming Conventions

### Package Names

Follow these naming conventions for consistency:

#### npm Packages

```
gunshi-plugin-{feature}         # Standalone packages
@{org}/gunshi-plugin-{feature}  # Scoped packages
```

Examples:

- `gunshi-plugin-logger`
- `gunshi-plugin-auth`
- `@mycompany/gunshi-plugin-database`

#### JSR Packages

```
@{username}/gunshi-plugin-{feature}
```

Examples:

- `@johndoe/gunshi-plugin-logger`
- `@acme/gunshi-plugin-database`

### Plugin IDs

Use namespaced IDs to avoid conflicts:

```ts
// Good: Namespaced
export const pluginId = 'mycompany:logger' as const
export const pluginId = 'g:renderer' as const // 'g:' for official Gunshi plugins

// Avoid: Generic names that might conflict
export const pluginId = 'logger' as const
export const pluginId = 'auth' as const
```

## Version Management

### Semantic Versioning

Follow semantic versioning (semver):

```
MAJOR.MINOR.PATCH

1.0.0 - Initial release
1.0.1 - Bug fixes
1.1.0 - New features (backward compatible)
2.0.0 - Breaking changes
```

### Changelog

Maintain a CHANGELOG.md:

```md
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- eslint-disable markdown/no-missing-label-refs -->

## [Unreleased]

## [1.1.0] - 2024-01-15

### Added

- New `processData` method for batch processing
- Support for custom timeout configuration

### Fixed

- Memory leak in extension cleanup
- Type inference for generic methods

### Changed

- Improved error messages for better debugging
- Updated minimum Node.js version to 18

## [1.0.0] - 2024-01-01

### Added

- Initial release
- Basic plugin functionality
- TypeScript support

<!-- eslint-enable markdown/no-missing-label-refs -->
```

### Version Scripts

Automate version management:

```json
{
  "scripts": {
    "version": "npm run build && git add -A",
    "postversion": "git push && git push --tags",
    "release:patch": "npm version patch && npm publish",
    "release:minor": "npm version minor && npm publish",
    "release:major": "npm version major && npm publish"
  }
}
```

## Publishing to npm

### Pre-publish Checklist

1. **Update version** in package.json
2. **Update CHANGELOG.md** with release notes
3. **Run tests**: `npm test`
4. **Build package**: `npm run build`
5. **Check package contents**: `npm pack --dry-run`
6. **Update documentation** if needed

### Publishing Process

```sh
# Login to npm (first time only)
npm login

# Publish to npm
npm publish

# Or with scoped package
npm publish --access public
```

### Automated Publishing

Use GitHub Actions for automated releases:

```yaml
# .github/workflows/publish.yml
name: Publish

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'

      - run: npm ci
      - run: npm test
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Publishing to JSR

### JSR Setup

1. **Create JSR account** at <https://jsr.io>
2. **Configure authentication**:

```sh
# Authenticate with JSR
deno login
```

### Publishing Process

```sh
# Publish to JSR
jsr publish

# Or with specific version
jsr publish --version 1.0.0

# Dry run to check what will be published
jsr publish --dry-run
```

### JSR with GitHub Actions

```yaml
# .github/workflows/jsr-publish.yml
name: Publish to JSR

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v4

      - run: npx jsr publish
```

## Documentation

### README.md Template

```md
# gunshi-plugin-myfeature

> MyFeature plugin for Gunshi CLI framework

[![npm version](https://badge.fury.io/js/gunshi-plugin-myfeature.svg)](https://www.npmjs.com/package/gunshi-plugin-myfeature)
[![JSR](https://jsr.io/badges/@yourusername/gunshi-plugin-myfeature)](https://jsr.io/@yourusername/gunshi-plugin-myfeature)

## Features

- ✨ Feature 1
- 🚀 Feature 2
- 🔧 Feature 3

## Installation

\`\`\`bash

# npm

npm install gunshi-plugin-myfeature

# JSR

deno add @yourusername/gunshi-plugin-myfeature
\`\`\`

## Usage

<!-- eslint-disable markdown/no-missing-label-refs -->

\`\`\`ts
import { cli } from 'gunshi'
import myPlugin from 'gunshi-plugin-myfeature'

await cli(process.argv.slice(2), command, {
name: 'my-cli',
plugins: [myPlugin()]
})
\`\`\`

<!-- eslint-enable markdown/no-missing-label-refs -->

## API

### Plugin Options

\`\`\`ts
myPlugin({
baseUrl: '<https://api.example.com>',
timeout: 5000
})
\`\`\`

### Extension Methods

The plugin provides the following extension methods:

- \`doSomething()\`: Description
- \`getValue()\`: Description

## Examples

See the [examples](./examples) directory for complete examples.

## License

MIT
```

## Guidelines

### 1. Minimize Bundle Size

Keep your plugin lightweight:

```ts
// Use dynamic imports for heavy dependencies
extension: () => ({
  heavyOperation: async () => {
    const { heavyFunction } = await import('./heavy-module')
    return heavyFunction()
  }
})
```

### 2. Declare Peer Dependencies

Don't bundle Gunshi with your plugin:

```json
{
  "peerDependencies": {
    "@gunshi/plugin": "^0.27.0",
    "gunshi": "^0.27.0"
  },
  "peerDependenciesMeta": {
    "@gunshi/plugin": { "optional": true },
    "gunshi": { "optional": true }
  }
}
```

### 3. Export Everything Needed

Make sure to export all types and constants:

```ts
// index.ts
export { pluginId, type PluginId } from './types'
export type { MyExtension, MyPluginOptions } from './types'
export { default } from './plugin'
```

### 4. Include Examples

Provide working examples:

```ts
// examples/basic.js
import { cli, define } from 'gunshi'
import myPlugin from '../lib/index.js'

const command = define({
  name: 'example',
  run: ctx => {
    ctx.extensions['mycompany:my-plugin'].doSomething()
  }
})

await cli(process.argv.slice(2), command, {
  name: 'example-cli',
  plugins: [myPlugin()]
})
```

### 5. Test Before Publishing

Always test the published package:

```sh
# Pack locally
npm pack

# Test in another project
npm install ../path/to/gunshi-plugin-myfeature-1.0.0.tgz
```

## Maintenance

### Dependency Updates

Keep dependencies up to date:

```sh
# Check outdated packages
npm outdated

# Update dependencies
npm update

# Or use npm-check-updates
npx npm-check-updates -u
npm install
```

### Security Audits

Regularly audit for vulnerabilities:

```sh
# Run security audit
npm audit

# Fix automatically
npm audit fix
```

### Deprecation

When deprecating a plugin:

```json
// package.json
{
  "deprecated": "This package has been deprecated. Please use @new/package instead."
}
```

```sh
# Deprecate on npm
npm deprecate gunshi-plugin-old "Please use gunshi-plugin-new instead"
```

## Next Steps

- Review [Guidelines](./guidelines.md) for production plugins
- Explore [Plugin List](./list.md) for distribution examples
- Learn about [Plugin Testing](./testing.md) before publishing
