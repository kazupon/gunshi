# combinators

> [!WARNING]
> This module is experimental and may change in future versions.

Parser combinator entry point.

This entry point exports composable combinator factory functions for building
type-safe argument schemas. These combinators produce [ArgSchema](/api/default/interfaces/ArgSchema.md) objects
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

## Functions

| Function | Description |
| ------ | ------ |
| [args](/api/combinators/functions/args.md) | Type-safe schema factory. |
| [boolean](/api/combinators/functions/boolean.md) | Create a boolean argument schema. |
| [choice](/api/combinators/functions/choice.md) | Create an enum-like argument schema with literal type inference. |
| [combinator](/api/combinators/functions/combinator.md) | Create a custom argument schema with a user-defined parse function. |
| [describe](/api/combinators/functions/describe.md) | Set a description on a combinator schema for help text generation. |
| [extend](/api/combinators/functions/extend.md) | Extend a schema by overriding or adding fields. |
| [float](/api/combinators/functions/float.md) | Create a floating-point argument schema with optional range validation. |
| [integer](/api/combinators/functions/integer.md) | Create an integer argument schema with optional range validation. |
| [map](/api/combinators/functions/map.md) | Transform the output of a combinator schema. |
| [merge](/api/combinators/functions/merge.md) | Compose multiple [Args](/api/default/interfaces/Args.md) schemas into one. |
| [multiple](/api/combinators/functions/multiple.md) | Mark a combinator schema as accepting multiple values. |
| [number](/api/combinators/functions/number.md) | Create a number argument schema with optional range validation. |
| [positional](/api/combinators/functions/positional.md) | Create a positional argument schema. |
| [required](/api/combinators/functions/required.md) | Mark a combinator schema as required. |
| [short](/api/combinators/functions/short.md) | Set a short alias on a combinator schema. |
| [string](/api/combinators/functions/string.md) | Create a string argument schema with optional validation. |
| [unrequired](/api/combinators/functions/unrequired.md) | Mark a combinator schema as not required. |
| [withDefault](/api/combinators/functions/withDefault.md) | Set a default value on a combinator schema. |

## Interfaces

| Interface | Description |
| ------ | ------ |
| [BaseOptions](/api/combinators/interfaces/BaseOptions.md) | Common options shared by all base combinators. |
| [BooleanOptions](/api/combinators/interfaces/BooleanOptions.md) | Options for the [boolean](/api/combinators/functions/boolean.md) combinator. |
| [CombinatorOptions](/api/combinators/interfaces/CombinatorOptions.md) | Options for the [combinator](/api/combinators/functions/combinator.md) factory function. |
| [FloatOptions](/api/combinators/interfaces/FloatOptions.md) | Options for the [float](/api/combinators/functions/float.md) combinator. |
| [IntegerOptions](/api/combinators/interfaces/IntegerOptions.md) | Options for the [integer](/api/combinators/functions/integer.md) combinator. |
| [NumberOptions](/api/combinators/interfaces/NumberOptions.md) | Options for the [number](/api/combinators/functions/number.md) combinator. |
| [StringOptions](/api/combinators/interfaces/StringOptions.md) | Options for the [string](/api/combinators/functions/string.md) combinator. |

## Type Aliases

| Type Alias | Description |
| ------ | ------ |
| [Combinator](/api/combinators/type-aliases/Combinator.md) | A combinator produced by combinator factory functions. |
| [CombinatorSchema](/api/combinators/type-aliases/CombinatorSchema.md) | A schema produced by combinator factory functions. Any [ArgSchema](/api/default/interfaces/ArgSchema.md) with a parse function qualifies. |

