# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gunshi is a modern JavaScript command-line library for creating CLI applications. It supports multiple JavaScript runtimes (Node.js, Deno, Bun) and provides features like declarative command configuration, type safety, composable sub-commands, lazy loading, internationalization, and a powerful plugin system.

This is a **pnpm workspace monorepo** containing the core library, plugins, utilities, and documentation. The project emphasizes type safety, runtime compatibility, minimal dependencies, and extensibility through a well-designed plugin architecture.

## Essential Commands

```sh
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run all tests with type checking
pnpm test

# Run E2E tests
pnpm e2e

# Run tests for specific packages
pnpm test:core                  # Core gunshi package
pnpm test:plugin-global         # Global options plugin
pnpm test:plugin-i18n           # i18n plugin
pnpm test:plugin-renderer       # Renderer plugin
pnpm test:plugin-completion     # Completion plugin

# Run linter (ESLint, Prettier, Knip, JSR checks)
pnpm lint

# Auto-fix linting issues
pnpm fix

# Run type checking
pnpm lint:typecheck             # Run all type checks (typecheck:deno, typecheck:tsc)
pnpm typecheck:deno             # Deno-specific type checking
pnpm typecheck:tsc              # TypeScript compiler diagnostics

# Run benchmarks
pnpm bench:vitest
pnpm bench:mitata

# Build documentation
pnpm build:docs

# Develop documentation site
pnpm dev:docs

# Release new version (bumps versions, creates tag, pushes)
pnpm release
```

## Monorepo Structure

The repository contains the following packages:

### Core Packages

- **`packages/gunshi/`** - Main library with CLI runtime, command system, and built-in plugins
  - Exports: `cli`, `define`, `defineWithTypes`, `lazy`, `lazyWithTypes`, `plugin`, `createCommandContext`
  - Published to: npm, JSR

- **`packages/bone/`** - Minimal gunshi distribution without plugins (`@gunshi/bone`)
  - Smaller bundle size for lightweight CLIs
  - Published to: npm, JSR

- **`packages/definition/`** - Command definition utilities (`@gunshi/definition`)
  - Provides `define`, `defineWithTypes`, `lazy`, `lazyWithTypes` helpers
  - Published to: npm, JSR

- **`packages/plugin/`** - Plugin development kit (`@gunshi/plugin`)
  - Type definitions and APIs for creating plugins
  - Same exports as `gunshi/plugin` but with smaller footprint
  - Published to: npm, JSR

### Support Packages

- **`packages/shared/`** - Shared utilities (`@gunshi/shared`)
  - Common utilities used across packages
  - Localization helpers, key resolution, type utilities

- **`packages/resources/`** - Built-in localization resources (`@gunshi/resources`)
  - Default translations for built-in messages
  - Supports multiple locales

### Official Plugins

- **`packages/plugin-global/`** - Global options plugin (`@gunshi/plugin-global`)
  - Provides `--version`, `--help` options
  - Header/usage rendering utilities

- **`packages/plugin-i18n/`** - Internationalization plugin (`@gunshi/plugin-i18n`)
  - Locale management and resource loading
  - Translation adapters for multiple i18n libraries
  - Helpers: `defineI18n`, `defineI18nWithTypes`, `withI18nResource`

- **`packages/plugin-renderer/`** - Usage/help renderer plugin (`@gunshi/plugin-renderer`)
  - Customizable help text and validation error rendering
  - Works with i18n plugin for localized output

- **`packages/plugin-completion/`** - Shell completion plugin (`@gunshi/plugin-completion`)
  - Tab completion for commands and options
  - Supports bash, zsh, fish

- **`packages/plugin-dryrun/`** - Dry-run mode plugin (`@gunshi/plugin-dryrun`)
  - Adds `--dry-run` option to commands

### Documentation

- **`packages/docs/`** - Documentation site (VitePress)
  - Available at: [gunshi.dev](https://gunshi.dev)
  - Guides, API references, examples

## Architecture Overview

### Core Library (`packages/gunshi/src/`)

```sh
packages/gunshi/src/
├── index.ts              # Main entry point, exports public APIs
├── bone.ts               # Minimal CLI entry (no plugins)
├── cli.ts                # CLI entry with built-in plugins
├── cli/
│   ├── core.ts           # Core CLI execution logic
│   ├── builtin.ts        # Built-in plugin integration
│   └── bone.ts           # Bone CLI logic
├── context.ts            # Command context creation and management
├── definition.ts         # Command definition helpers
├── decorators.ts         # Command runner decorators
├── generator.ts          # Command generator utilities
├── renderer.ts           # Usage/help rendering
├── utils.ts              # Runtime utilities (Node.js, Deno, Bun)
├── types.ts              # TypeScript type definitions
├── constants.ts          # Constants and defaults
└── plugin/
    ├── core.ts           # Plugin system core
    ├── context.ts        # Plugin context management
    └── dependency.ts     # Plugin dependency resolution

# Test files are co-located with source files
├── *.test.ts             # Unit tests (Vitest)
├── *.test-d.ts           # Type tests (Vitest + TypeScript)
└── __snapshots__/        # Snapshot test fixtures
```

### Key Design Patterns

- **Declarative Commands**: Commands are defined as objects with `name`, `description`, `args`, and `run` properties
- **Type Safety**: Full TypeScript support with type inference for arguments and context
- **Plugin System**: Extensible architecture with dependency management, lifecycle hooks, and context extensions
- **Lazy Loading**: Commands can be lazily loaded for better performance
- **Runtime Agnostic**: Works across Node.js, Deno, and Bun with runtime-specific utilities

### Playground Examples

```sh
playground/
├── essentials/           # Basic CLI examples
├── advanced/             # Advanced features (sub-commands, lazy loading)
├── plugins/              # Plugin usage examples
├── bun/                  # Bun runtime examples
└── deno/                 # Deno runtime examples
```

## Plugin System

Gunshi has a fully-implemented, production-ready plugin system. Plugins can:

- Extend command context with new properties/methods
- Add lifecycle hooks (beforeRun, afterRun, etc.)
- Declare dependencies on other plugins
- Provide decorators to wrap command execution
- Add global options and configuration

### Official Plugins

1. **@gunshi/plugin-global** - Global `--version`, `--help` options
2. **@gunshi/plugin-i18n** - Internationalization with resource management
3. **@gunshi/plugin-renderer** - Customizable help/error rendering
4. **@gunshi/plugin-completion** - Shell tab completion
5. **@gunshi/plugin-dryrun** - Dry-run mode support

### Plugin Development

When creating plugins:

- Use `@gunshi/plugin` package for minimal dependencies
- Follow the plugin API defined in `packages/plugin/src/`
- See `packages/plugin/README.md` for comprehensive documentation
- Reference official plugins for examples

## Development Guidelines

### Code Style & Quality

1. **TypeScript Strict Mode**: All source code uses TypeScript with strict mode enabled
2. **ES Modules**: Use ES modules throughout (`import`/`export`, not `require`)
3. **Code Style**: Enforced by ESLint and Prettier (run `pnpm fix` to auto-fix)
4. **Linting**: Must pass `pnpm lint` before submitting PRs
   - ESLint for code quality
   - Prettier for formatting
   - Knip for unused exports detection
   - JSR export validation

### Testing Requirements

1. **Co-located Tests**: Test files are placed alongside source files with `.test.ts` extension
2. **Test Coverage**: Add tests for all new features
3. **Test Types**:
   - Unit tests: `*.test.ts` (Vitest)
   - Type tests: `*.test-d.ts` (Vitest + TypeScript)
   - E2E tests: `*.spec.ts` (Vitest)
4. **Snapshot Tests**: Used for renderer output validation
5. **Test Commands**: Use package-specific test commands when working on a single package

### Type Safety

- Maintain strict TypeScript types throughout the codebase
- Use type inference where possible
- Provide type helpers for plugin developers (`GunshiParams`, `CommandContext`, etc.)
- Test types with `.test-d.ts` files

## Testing Approach

### Unit Tests (Vitest)

- Test files: `**/*.test.ts`
- Location: Co-located with source files in `packages/*/src/`
- Framework: Vitest with TypeScript type checking
- Run: `pnpm test` or `pnpm test:core`, `pnpm test:plugin-*`
- Coverage: Configured in `vitest.config.ts`

### E2E Tests

- Test files: `**/*.spec.ts`
- Configuration: `vitest.e2e.config.ts`
- Run: `pnpm e2e`

### Type Tests

- Test files: `**/*.test-d.ts`
- Purpose: Validate TypeScript type inference and type safety
- Framework: Vitest with `expectTypeOf`

### Snapshot Tests

- Used for renderer output validation
- Located in `__snapshots__/` directories
- Update snapshots when renderer behavior changes intentionally

## Build & Deploy

### Build Tool

- **tsdown**: Modern TypeScript bundler powered by Rolldown
- Configuration: `tsdown.config.ts` in each package
- Features:
  - TypeScript compilation with declaration files
  - Publint validation
  - JSR export validation
  - Multi-entry support

### Build Commands

```sh
pnpm build                      # Build all packages
pnpm build:gunshi               # Build core package only
pnpm build:plugin:global        # Build specific plugin
```

### Deployment

Packages are published to:

- **npm**: For Node.js users (`npm install gunshi`)
- **JSR**: For Deno/Bun users (`deno add jsr:@kazupon/gunshi`)

## Important Notes

### Multi-Runtime Support

- The project supports Node.js, Deno, and Bun
- Runtime-specific utilities are in `packages/gunshi/src/utils.ts`
- Always test changes across all supported runtimes when modifying core functionality
- Use `pnpm typecheck:deno` for Deno-specific type checking

### Parser & Resolver Changes

- When modifying command parsing or resolution logic, verify impact on all playground examples
- Test with various argument combinations and edge cases

### Bundle Size

- The library aims for minimal dependencies and small bundle size
- Check bundle size impact with `publint` (runs automatically during build)
- Use `@gunshi/bone` for minimal footprint

### Plugin System

- Plugin system is production-ready and fully documented
- Plugins can extend CLI functionality without modifying core
- See `packages/plugin/README.md` for detailed plugin development guide
- Official plugins serve as reference implementations

### Documentation

- Documentation site: [gunshi.dev](https://gunshi.dev)
- API docs are auto-generated from TypeScript types
- Update documentation when adding new features or changing APIs
