# plugin

The entry point for Gunshi plugin module.

## Example

```js
import { plugin } from 'gunshi/plugin'

export default yourPlugin() {
  return plugin({
    id: 'your-plugin-id',
    setup: (ctx) => {
      // your plugin setup logic here
    },
  })
}
```

**[Source](https://github.com/kazupon/gunshi/blob/main/plugin)**

## Variables

| Variable                                                               | Description |
| ---------------------------------------------------------------------- | ----------- |
| [CLI_OPTIONS_DEFAULT](/api-ox/plugin/variables/CLI_OPTIONS_DEFAULT.md) |             |

## References

### ANONYMOUS_COMMAND_NAME

Re-exports [ANONYMOUS_COMMAND_NAME](/api-ox/default/variables/ANONYMOUS_COMMAND_NAME.md)

---

### Args

Re-exports [Args](/api-ox/default/interfaces/Args.md)

---

### ArgSchema

Re-exports [ArgSchema](/api-ox/default/interfaces/ArgSchema.md)

---

### ArgToken

Re-exports [ArgToken](/api-ox/default/interfaces/ArgToken.md)

---

### ArgValues

Re-exports [ArgValues](/api-ox/default/type-aliases/ArgValues.md)

---

### Awaitable

Re-exports [Awaitable](/api-ox/default/type-aliases/Awaitable.md)

---

### Command

Re-exports [Command](/api-ox/default/interfaces/Command.md)

---

### CommandContext

Re-exports [CommandContext](/api-ox/default/interfaces/CommandContext.md)

---

### CommandContextCore

Re-exports [CommandContextCore](/api-ox/default/type-aliases/CommandContextCore.md)

---

### CommandContextExtension

Re-exports [CommandContextExtension](/api-ox/default/interfaces/CommandContextExtension.md)

---

### CommandContextParams

Re-exports [CommandContextParams](/api-ox/context/interfaces/CommandContextParams.md)

---

### CommandDecorator

Re-exports [CommandDecorator](/api-ox/default/type-aliases/CommandDecorator.md)

---

### CommandExamplesFetcher

Re-exports [CommandExamplesFetcher](/api-ox/default/type-aliases/CommandExamplesFetcher.md)

---

### CommandRunner

Re-exports [CommandRunner](/api-ox/default/type-aliases/CommandRunner.md)

---

### createCommandContext

Re-exports [createCommandContext](/api-ox/context/functions/createCommandContext.md)

---

### DefaultGunshiParams

Re-exports [DefaultGunshiParams](/api-ox/default/type-aliases/DefaultGunshiParams.md)

---

### ExtendContext

Re-exports [ExtendContext](/api-ox/default/type-aliases/ExtendContext.md)

---

### GunshiParams

Re-exports [GunshiParams](/api-ox/default/interfaces/GunshiParams.md)

---

### GunshiParamsConstraint

Re-exports [GunshiParamsConstraint](/api-ox/default/type-aliases/GunshiParamsConstraint.md)

---

### LazyCommand

Re-exports [LazyCommand](/api-ox/default/type-aliases/LazyCommand.md)

---

### OnPluginExtension

Re-exports [OnPluginExtension](/api-ox/default/type-aliases/OnPluginExtension.md)

---

### Plugin

Re-exports [Plugin](/api-ox/default/type-aliases/Plugin.md)

---

### plugin

Re-exports [plugin](/api-ox/default/functions/plugin.md)

---

### PluginContext

Re-exports [PluginContext](/api-ox/default/interfaces/PluginContext.md)

---

### PluginDependency

Re-exports [PluginDependency](/api-ox/default/interfaces/PluginDependency.md)

---

### PluginExtension

Re-exports [PluginExtension](/api-ox/default/type-aliases/PluginExtension.md)

---

### PluginFunction

Re-exports [PluginFunction](/api-ox/default/type-aliases/PluginFunction.md)

---

### PluginOptions

Re-exports [PluginOptions](/api-ox/default/interfaces/PluginOptions.md)

---

### PluginWithExtension

Re-exports [PluginWithExtension](/api-ox/default/interfaces/PluginWithExtension.md)

---

### PluginWithoutExtension

Re-exports [PluginWithoutExtension](/api-ox/default/interfaces/PluginWithoutExtension.md)

---

### Prettify

Re-exports [Prettify](/api-ox/default/type-aliases/Prettify.md)

---

### RendererDecorator

Re-exports [RendererDecorator](/api-ox/default/type-aliases/RendererDecorator.md)

---

### ValidationErrorsDecorator

Re-exports [ValidationErrorsDecorator](/api-ox/default/type-aliases/ValidationErrorsDecorator.md)
