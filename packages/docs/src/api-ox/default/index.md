# default

gunshi cli entry point.

This entry point exports the bellow APIs and types:

- `cli`: The main CLI function to run the command, included `global options` and `usage renderer` built-in plugins.
- `define`: A function to define a command.
- `defineWithTypes`: A function to define a command with specific type parameters.
- `lazy`: A function to lazily load a command.
- `lazyWithTypes`: A function to lazily load a command with specific type parameters.
- `plugin`: A function to create a plugin.
- `createCommandContext`: A function to create a command context, mainly for testing purposes.
- `args-tokens` utilities, `parseArgs` and `resolveArgs` for parsing command line arguments.
- Some basic type definitions, such as `CommandContext`, `Plugin`, `PluginContext`, etc.

## Example

```js
import { cli } from 'gunshi'
```

**[Source](https://github.com/kazupon/gunshi/blob/main/default)**

## Variables

| Variable                                                                      | Description |
| ----------------------------------------------------------------------------- | ----------- |
| [ANONYMOUS_COMMAND_NAME](/api-ox/default/variables/ANONYMOUS_COMMAND_NAME.md) |             |

## Functions

| Function                                                | Description                                                                  |
| ------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [cli](/api-ox/default/functions/cli.md)                 | Run the command.                                                             |
| [parseArgs](/api-ox/default/functions/parseArgs.md)     | Parse command line arguments.                                                |
| [plugin](/api-ox/default/functions/plugin.md)           | Define a plugin with extension compatibility and typed dependency extensions |
| [resolveArgs](/api-ox/default/functions/resolveArgs.md) | Resolve command line arguments.                                              |

## Classes

| Class                                                               | Description                                     |
| ------------------------------------------------------------------- | ----------------------------------------------- |
| [DefaultTranslation](/api-ox/default/classes/DefaultTranslation.md) | Default implementation of `TranslationAdapter`. |

## Interfaces

| Interface                                                                        | Description                                                                                                   |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| [Args](/api-ox/default/interfaces/Args.md)                                       | An object that contains [argument schema](/api-ox/default/interfaces/ArgSchema.md).                           |
| [ArgSchema](/api-ox/default/interfaces/ArgSchema.md)                             | An argument schema definition for command-line argument parsing.                                              |
| [ArgToken](/api-ox/default/interfaces/ArgToken.md)                               | Argument token.                                                                                               |
| [CliOptions](/api-ox/default/interfaces/CliOptions.md)                           | CLI options of [`cli`](/api-ox/default/functions/cli.md) function.                                            |
| [Command](/api-ox/default/interfaces/Command.md)                                 | Command interface.                                                                                            |
| [CommandContext](/api-ox/default/interfaces/CommandContext.md)                   | Command context.                                                                                              |
| [CommandContextExtension](/api-ox/default/interfaces/CommandContextExtension.md) | Command context extension                                                                                     |
| [CommandEnvironment](/api-ox/default/interfaces/CommandEnvironment.md)           | Command environment.                                                                                          |
| [GunshiParams](/api-ox/default/interfaces/GunshiParams.md)                       | Gunshi unified parameter type.                                                                                |
| [PluginContext](/api-ox/default/interfaces/PluginContext.md)                     | Gunshi plugin context interface.                                                                              |
| [PluginDependency](/api-ox/default/interfaces/PluginDependency.md)               | Plugin dependency definition                                                                                  |
| [PluginOptions](/api-ox/default/interfaces/PluginOptions.md)                     | Plugin definition options                                                                                     |
| [PluginWithExtension](/api-ox/default/interfaces/PluginWithExtension.md)         | Plugin return type with extension, which includes the plugin ID, name, dependencies, and extension.           |
| [PluginWithoutExtension](/api-ox/default/interfaces/PluginWithoutExtension.md)   | Plugin return type without extension, which includes the plugin ID, name, and dependencies, but no extension. |
| [RenderingOptions](/api-ox/default/interfaces/RenderingOptions.md)               | Rendering control options                                                                                     |
| [SubCommandable](/api-ox/default/interfaces/SubCommandable.md)                   | Sub-command entry type for use in subCommands.                                                                |

## References

### CommandContextParams

Re-exports [CommandContextParams](/api-ox/context/interfaces/CommandContextParams.md)

---

### createCommandContext

Re-exports [createCommandContext](/api-ox/context/functions/createCommandContext.md)

---

### define

Re-exports [define](/api-ox/definition/functions/define.md)

---

### defineWithTypes

Re-exports [defineWithTypes](/api-ox/definition/functions/defineWithTypes.md)

---

### lazy

Re-exports [lazy](/api-ox/definition/functions/lazy.md)

---

### lazyWithTypes

Re-exports [lazyWithTypes](/api-ox/definition/functions/lazyWithTypes.md)

## Type Aliases

| Type Alias                                                                             | Description                                                                                                                                                                                                 |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ArgValues](/api-ox/default/type-aliases/ArgValues.md)                                 | An object that contains the values of the arguments.                                                                                                                                                        |
| [Awaitable](/api-ox/default/type-aliases/Awaitable.md)                                 | Awaitable type.                                                                                                                                                                                             |
| [Commandable](/api-ox/default/type-aliases/Commandable.md)                             | Define a command type.                                                                                                                                                                                      |
| [CommandCallMode](/api-ox/default/type-aliases/CommandCallMode.md)                     | Command call mode.                                                                                                                                                                                          |
| [CommandContextCore](/api-ox/default/type-aliases/CommandContextCore.md)               | Readonly command context available to a command context extension factory.                                                                                                                                  |
| [CommandDecorator](/api-ox/default/type-aliases/CommandDecorator.md)                   | Command decorator.                                                                                                                                                                                          |
| [CommandExamplesFetcher](/api-ox/default/type-aliases/CommandExamplesFetcher.md)       | Command examples fetcher.                                                                                                                                                                                   |
| [CommandLoader](/api-ox/default/type-aliases/CommandLoader.md)                         | Command loader.                                                                                                                                                                                             |
| [CommandRunner](/api-ox/default/type-aliases/CommandRunner.md)                         | Command runner.                                                                                                                                                                                             |
| [DefaultGunshiParams](/api-ox/default/type-aliases/DefaultGunshiParams.md)             | Default Gunshi parameters.                                                                                                                                                                                  |
| [ExtendContext](/api-ox/default/type-aliases/ExtendContext.md)                         | Extend command context type. This type is used to extend the command context with additional properties at [`CommandContext.extensions`](/api-ox/default/interfaces/CommandContext.md#property-extensions). |
| [GunshiParamsConstraint](/api-ox/default/type-aliases/GunshiParamsConstraint.md)       | Generic constraint for command-related types.                                                                                                                                                               |
| [LazyCommand](/api-ox/default/type-aliases/LazyCommand.md)                             | Lazy command interface.                                                                                                                                                                                     |
| [OnPluginExtension](/api-ox/default/type-aliases/OnPluginExtension.md)                 | Plugin extension callback, which is called when the plugin is extended with `extension` option.                                                                                                             |
| [Plugin](/api-ox/default/type-aliases/Plugin.md)                                       | Gunshi plugin, which is a function that receives a PluginContext.                                                                                                                                           |
| [PluginExtension](/api-ox/default/type-aliases/PluginExtension.md)                     | Plugin extension                                                                                                                                                                                            |
| [PluginFunction](/api-ox/default/type-aliases/PluginFunction.md)                       | Plugin function type                                                                                                                                                                                        |
| [Prettify](/api-ox/default/type-aliases/Prettify.md)                                   | Prettify a type by flattening its structure.                                                                                                                                                                |
| [RendererDecorator](/api-ox/default/type-aliases/RendererDecorator.md)                 | Renderer decorator type.                                                                                                                                                                                    |
| [ValidationErrorsDecorator](/api-ox/default/type-aliases/ValidationErrorsDecorator.md) | Validation errors renderer decorator type. A function that wraps a validation errors renderer to add or modify its behavior.                                                                                |
