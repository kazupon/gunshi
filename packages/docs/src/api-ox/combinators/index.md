# combinators

> [!WARNING]
> This module is experimental and may change in future versions.

Parser combinator entry point.

This entry point exports composable combinator factory functions for building
type-safe argument schemas. These combinators produce [ArgSchema](/api-ox/default/interfaces/ArgSchema.md) objects
that can be used anywhere regular argument schemas are accepted.

## Example

```ts
import { string, integer, boolean, required, withDefault, short } from 'gunshi/combinators'
import { define, cli } from 'gunshi'

const command = define({
  name: 'serve',
  args: {
    host: withDefault(string(), 'localhost'),
    port: withDefault(integer({ min: 1, max: 65535 }), 8080),
    verbose: short(boolean(), 'v')
  },
  run: ctx => {
    console.log(`Listening on ${ctx.values.host}:${ctx.values.port}`)
  }
})
```

**[Source](https://github.com/kazupon/gunshi/blob/main/combinators)**

## Functions

| Function                                                    | Description                                                                   |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [args](/api-ox/combinators/functions/args.md)               | Type-safe schema factory.                                                     |
| [boolean](/api-ox/combinators/functions/boolean.md)         | Create a boolean argument schema.                                             |
| [choice](/api-ox/combinators/functions/choice.md)           | Create an enum-like argument schema with literal type inference.              |
| [combinator](/api-ox/combinators/functions/combinator.md)   | Create a custom argument schema with a user-defined parse function.           |
| [describe](/api-ox/combinators/functions/describe.md)       | Set a description on a combinator schema for help text generation.            |
| [extend](/api-ox/combinators/functions/extend.md)           | Extend a schema by overriding or adding fields.                               |
| [float](/api-ox/combinators/functions/float.md)             | Create a floating-point argument schema with optional range validation.       |
| [integer](/api-ox/combinators/functions/integer.md)         | Create an integer argument schema with optional range validation.             |
| [map](/api-ox/combinators/functions/map.md)                 | Transform the output of a combinator schema.                                  |
| [merge](/api-ox/combinators/functions/merge.md)             | Compose multiple [Args](/api-ox/default/interfaces/Args.md) schemas into one. |
| [multiple](/api-ox/combinators/functions/multiple.md)       | Mark a combinator schema as accepting multiple values.                        |
| [number](/api-ox/combinators/functions/number.md)           | Create a number argument schema with optional range validation.               |
| [positional](/api-ox/combinators/functions/positional.md)   | Create a positional argument schema.                                          |
| [required](/api-ox/combinators/functions/required.md)       | Mark a combinator schema as required.                                         |
| [short](/api-ox/combinators/functions/short.md)             | Set a short alias on a combinator schema.                                     |
| [string](/api-ox/combinators/functions/string.md)           | Create a string argument schema with optional validation.                     |
| [unrequired](/api-ox/combinators/functions/unrequired.md)   | Mark a combinator schema as not required.                                     |
| [withDefault](/api-ox/combinators/functions/withDefault.md) | Set a default value on a combinator schema.                                   |

## Interfaces

| Interface                                                                | Description                                                                                 |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| [BaseOptions](/api-ox/combinators/interfaces/BaseOptions.md)             | Common options shared by all base combinators.                                              |
| [BooleanOptions](/api-ox/combinators/interfaces/BooleanOptions.md)       | Options for the [boolean](/api-ox/combinators/functions/boolean.md) combinator.             |
| [CombinatorOptions](/api-ox/combinators/interfaces/CombinatorOptions.md) | Options for the [combinator](/api-ox/combinators/functions/combinator.md) factory function. |
| [FloatOptions](/api-ox/combinators/interfaces/FloatOptions.md)           | Options for the [float](/api-ox/combinators/functions/float.md) combinator.                 |
| [IntegerOptions](/api-ox/combinators/interfaces/IntegerOptions.md)       | Options for the [integer](/api-ox/combinators/functions/integer.md) combinator.             |
| [NumberOptions](/api-ox/combinators/interfaces/NumberOptions.md)         | Options for the [number](/api-ox/combinators/functions/number.md) combinator.               |
| [StringOptions](/api-ox/combinators/interfaces/StringOptions.md)         | Options for the [string](/api-ox/combinators/functions/string.md) combinator.               |

## Type Aliases

| Type Alias                                                               | Description                                                                                                                                  |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| [Combinator](/api-ox/combinators/type-aliases/Combinator.md)             | A combinator produced by combinator factory functions.                                                                                       |
| [CombinatorSchema](/api-ox/combinators/type-aliases/CombinatorSchema.md) | A schema produced by combinator factory functions. Any [ArgSchema](/api-ox/default/interfaces/ArgSchema.md) with a parse function qualifies. |
