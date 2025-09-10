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

## Next Steps

Now that you understand what Gunshi is and its key features, here's how to proceed with the documentation:

### Documentation Structure

The Gunshi documentation is organized into three main sections:

- **Essentials**: Learn the fundamental concepts of Gunshi through a step-by-step tutorial format. This section covers everything from basic usage to composable commands and lazy loading.

- **Advanced**: Explore specialized features organized by topic. Each chapter focuses on a specific advanced capability like internationalization, custom rendering, or type system extensions.

- **Plugin**: Understand the plugin system through a tutorial approach. Learn how to create, configure, and distribute plugins for extending Gunshi's functionality.

### Where to Go Next

> [!TIP]
> Start with the **Setup** guide to install Gunshi in your project, then proceed through the **Essentials** section in order. Each chapter builds upon previous concepts.

1. **[Setup](./setup.md)** - Install and configure Gunshi in your project
2. **[Getting Started](../essentials/getting-started.md)** - Create your first CLI application
3. Continue through the **Essentials** section to learn core concepts

After completing the essentials, you can explore the **Advanced** section based on your specific needs. The chapters there are independent and can be read in any order.

If you're interested in extending Gunshi with plugins, the **Plugin** section provides comprehensive guidance on creating and using plugins.
