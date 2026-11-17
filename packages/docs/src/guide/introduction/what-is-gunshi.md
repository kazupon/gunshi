# What's Gunshi?

Gunshi is a JavaScript command-line library, your strategist for CLIs that people and AI agents use. It is designed to simplify the creation of command-line interfaces (CLIs).

## Origin of the Name

The name "gunshi" (軍師) refers to a position in ancient Japanese samurai battles where samurai devised strategies and gave orders. This name is inspired by the word "command", reflecting the library's purpose of handling command-line commands.

## Key Features

Gunshi is designed with several powerful features to make CLI development easier and more maintainable:

- 📏 **Simple & AI agent friendly**: Commands with simple APIs, output as JSON, and detects AI agents.
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

The CLIs that you build are used by people, by scripts, and by AI agents. Gunshi builds what each of them relies on from the definitions of your commands:

- **For people**: The help shows what to type, with the required options spelled out, and an error points to the help of the nearest command ([Auto Usage Generation](../essentials/auto-usage.md))
- **For scripts**: The errors go to stderr with a non-zero exit code, and a command that spreads `jsonArgs` prints its result and its errors as JSON with `--json` ([Errors and Exit Codes](../essentials/errors.md), [JSON Output](../essentials/json-output.md))
- **For AI agents**: `--help --json` describes a command as data, the JSON errors tell what to run next, and your CLI can tell when an agent runs it, to stop asking questions ([AI Agent Detection](../advanced/ai-agent-detection.md))

Whether you're building a simple CLI tool or a complex command-line application with multiple sub-commands, Gunshi provides the features you need to create a great user experience.

## Next Steps

Now that you understand what Gunshi is and its key features, here's how to proceed with the documentation:

### Documentation Structure

The Gunshi documentation is organized into three main sections:

- **Essentials**: Learn the fundamental concepts of Gunshi through a step-by-step tutorial format. This section covers everything from basic usage to composable commands and lazy loading.

- **Advanced**: Explore specialized features organized by topic. Each chapter focuses on a specific advanced capability like internationalization, custom rendering, or type system extensions.

- **Plugin**: Understand the plugin system through a tutorial approach. Learn how to create, configure, and distribute plugins for extending Gunshi's functionality.

### Where to Go Next

<!-- eslint-disable markdown/no-missing-label-refs -->

> [!TIP]
> Start with the **Setup** guide to install Gunshi in your project, then proceed through the **Essentials** section in order. Each chapter builds upon previous concepts.

<!-- eslint-enable markdown/no-missing-label-refs -->

1. **[Setup](./setup.md)** - Install and configure Gunshi in your project
2. **[Getting Started](../essentials/getting-started.md)** - Create your first CLI application
3. Continue through the **Essentials** section to learn core concepts

After completing the essentials, you can explore the **Advanced** section based on your specific needs. The chapters there are independent and can be read in any order.

If you're interested in extending Gunshi with plugins, the **Plugin** section provides comprehensive guidance on creating and using plugins.

## Credits

Gunshi project is made possible by the open-source community and the many innovative tools in the JavaScript and TypeScript ecosystem. We extend our gratitude to all contributors and maintainers whose work has laid the foundation for this project.

- [`citty`](https://github.com/unjs/citty), Provided the original inspiration for modern JavaScript command-line library.
- [`ordana`](https://github.com/sapphi-red/ordana), Inspired documentation generation in Gunshi
- [`@bomb.sh/tab`](https://github.com/bombshell-dev/tab), Powered by shell auto-completion for the JavaScript ecosystem
