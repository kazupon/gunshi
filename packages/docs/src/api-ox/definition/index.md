# definition

The entry for gunshi command definition.

This entry point exports the following APIs and types:

- `define`: A function to define a command.
- `defineWithTypes`: A function to define a command with specific type parameters.
- `lazy`: A function to lazily load a command.
- `lazyWithTypes`: A function to lazily load a command with specific type parameters.
- Some basic type definitions, such as `Command`, `LazyCommand`, etc.

## Example

```js
import { define } from 'gunshi/definition'

export default define({
  name: 'say',
  args: {
    say: {
      type: 'string',
      description: 'say something',
      default: 'hello!'
    }
  },
  run: ctx => {
    return `You said: ${ctx.values.say}`
  }
})
```

**[Source](https://github.com/kazupon/gunshi/blob/main/definition)**

## Functions

| Function                                                           | Description                                                                                         |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| [define](/api-ox/definition/functions/define.md)                   | Define a [command](/api-ox/default/interfaces/Command.md).                                          |
| [defineWithTypes](/api-ox/definition/functions/defineWithTypes.md) | Define a [command](/api-ox/default/interfaces/Command.md) with types                                |
| [lazy](/api-ox/definition/functions/lazy.md)                       | Define a [lazy command](/api-ox/default/type-aliases/LazyCommand.md).                               |
| [lazyWithTypes](/api-ox/definition/functions/lazyWithTypes.md)     | Define a [lazy command](/api-ox/default/type-aliases/LazyCommand.md) with specific type parameters. |

## References

### Args

Re-exports [Args](/api-ox/default/interfaces/Args.md)

---

### ArgSchema

Re-exports [ArgSchema](/api-ox/default/interfaces/ArgSchema.md)

---

### ArgValues

Re-exports [ArgValues](/api-ox/default/type-aliases/ArgValues.md)

---

### Command

Re-exports [Command](/api-ox/default/interfaces/Command.md)

---

### CommandContextParams

Re-exports [CommandContextParams](/api-ox/context/interfaces/CommandContextParams.md)

---

### CommandLoader

Re-exports [CommandLoader](/api-ox/default/type-aliases/CommandLoader.md)

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

### LazyCommand

Re-exports [LazyCommand](/api-ox/default/type-aliases/LazyCommand.md)
