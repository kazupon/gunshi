# What's Gunshi?

Gunshi is a modern JavaScript command-line library designed to simplify the creation of command-line interfaces (CLIs).

## Origin of the Name

The name "gunshi" (軍師) refers to a position in ancient Japanese samurai battles where a samurai devised strategies and gave orders. This name is inspired by the word "command", reflecting the library's purpose of handling command-line commands.

## Key Features

Gunshi is designed with several powerful features to make CLI development easier and more maintainable:

- 📏 **Simple & Universal**: Run commands with simple API and support for universal runtime (Node.js, Deno, Bun).
- ⚙️ **Declarative & Type Safe**: Configure commands declaratively with full TypeScript support and type-safe argument parsing by [args-tokens](https://github.com/kazupon/args-tokens)
- 🧩 **Composable & Lazy**: Create modular sub-commands with context sharing and lazy loading for better performance.
- 🎨 **Flexible Rendering**: Customize usage generation, validation errors, and help messages with pluggable renderers.
- 🌍 **Internationalization**: Built with global users in mind, featuring locale-aware design, resource management, and multi-language support.
- 🔌 **Pluggable**: Extensible plugin system with dependency management and lifecycle hooks for modular CLI development.

## Why Gunshi?

Gunshi provides a modern approach to building command-line interfaces in JavaScript and TypeScript. It's designed to be:

- **Developer-friendly**: Simple API with TypeScript support
- **Flexible**: Compose commands and customize behavior as needed
- **Maintainable**: Declarative configuration makes code easier to understand and maintain
- **Performant**: Lazy loading ensures resources are only loaded when needed

Whether you're building a simple CLI tool or a complex command-line application with multiple sub-commands, Gunshi provides the features you need to create a great user experience.
