# What's Gunshi?

Gunshi is a modern JavaScript command-line library designed to simplify the creation of command-line interfaces (CLIs).

## Origin of the Name

The name "gunshi" (軍師) refers to a position in ancient Japanese samurai battles where a samurai devised strategies and gave orders. This name is inspired by the word "command", reflecting the library's purpose of handling command-line commands.

## Key Features

Gunshi is designed with several powerful features to make CLI development easier and more maintainable:

- 📏 **Simple & Universal**: Run the commands with simple API and support universal runtime.
- ⚙️ **Declarative configuration**: Configure command modules declaratively for better organization and maintainability.
- 🛡️ **Type Safe**: TypeScript support with type-safe argument parsing and option resolution by [args-tokens](https://github.com/kazupon/args-tokens)
- 🧩 **Composable**: Create modular sub-commands that can be composed together for complex CLIs.
- ⏳ **Lazy & Async**: Load command modules lazily and execute them asynchronously for better performance.
- 📜 **Auto usage generation**: Generate helpful usage messages automatically for your commands.
- 🎨 **Custom usage generation**: Customize how usage messages are generated to match your CLI's style.
- 🌍 **Internationalization**: Support multiple languages with built-in i18n, locale resource lazy loading and i18n library integration.

## Why Gunshi?

Gunshi provides a modern approach to building command-line interfaces in JavaScript and TypeScript. It's designed to be:

- **Developer-friendly**: Simple API with TypeScript support
- **Flexible**: Compose commands and customize behavior as needed
- **Maintainable**: Declarative configuration makes code easier to understand and maintain
- **Performant**: Lazy loading ensures resources are only loaded when needed

Whether you're building a simple CLI tool or a complex command-line application with multiple sub-commands, Gunshi provides the features you need to create a great user experience.
