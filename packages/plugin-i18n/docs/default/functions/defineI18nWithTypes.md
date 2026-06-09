# Function: defineI18nWithTypes()

Define an i18n-aware [command](/packages/plugin-i18n/docs/default/interfaces/I18nCommand.md) with types

This helper function allows specifying the type parameter of `GunshiParams`
while inferring the `Args` type, `ExtendContext` type from the definition.

## Signature

```ts
export function defineI18nWithTypes<G extends GunshiParamsConstraint>(): DefineI18nWithTypesReturn<
  ExtractExtensions<G>,
  ExtractArgs<G>
>
```

## Type Parameters

| Name | Description |
| --- | --- |
| `G` *extends* `GunshiParamsConstraint` | A `GunshiParams` type |

## Returns

`DefineI18nWithTypesReturn<ExtractExtensions<G>, ExtractArgs<G>>` — A function that takes a command definition via [`defineI18n`](/packages/plugin-i18n/docs/default/functions/defineI18n.md)

## Examples

```ts
import { defineI18nWithTypes } from '@gunshi/plugin-i18n'

// Define a command with specific extensions type
type MyExtensions = { logger: { log: (message: string) => void } }

const greetCommand = defineI18nWithTypes<{ extensions: MyExtensions }>()({
  name: 'greet',
  args: {
    name: { type: 'string', description: 'Name to greet' }
  },
  resource: locale => {
    switch (locale.toString()) {
      case 'ja-JP': {
        return {
          'description': '誰かにあいさつ',
          'arg:name': 'あいさつするための名前'
        }
      }
      // other locales ...
    }
  },
  run: ctx => {
    // ctx.values is inferred as { name?: string }
    // ctx.extensions is MyExtensions
  }
})
```
