[**@gunshi/plugin-i18n**](../index.md)

***

[@gunshi/plugin-i18n](../index.md) / defineI18nWithTypes

# Function: defineI18nWithTypes()

```ts
function defineI18nWithTypes<G>(): DefineI18nWithTypesReturn<ExtractExtensions<G>, ExtractArgs<G>>;
```

Define an i18n-aware [command](../interfaces/I18nCommand.md) with types

This helper function allows specifying the type parameter of GunshiParams
while inferring the Args type, ExtendContext type from the definition.

## Type Parameters

| Type Parameter | Description |
| ------ | ------ |
| `G` *extends* `GunshiParamsConstraint` | A GunshiParams type |

## Returns

`DefineI18nWithTypesReturn`\<`ExtractExtensions`\<`G`\>, `ExtractArgs`\<`G`\>\>

A function that takes a command definition via [defineI18n](defineI18n.md)

## Example

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
