[**@gunshi/plugin-i18n**](../index.md)

***

[@gunshi/plugin-i18n](../index.md) / defineI18n

# Function: defineI18n()

```ts
function defineI18n<G>(command): I18nCommand<G>;
```

Define an i18n-aware command with type safety

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `G` *extends* `GunshiParamsConstraint` | `DefaultGunshiParams` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `command` | `Command`\<`G`\> & `object` |

## Returns

[`I18nCommand`](../interfaces/I18nCommand.md)\<`G`\>

## Example

```ts
import { defineI18n } from '@gunshi/plugin-i18n'

const greetCommand = defineI18n({
  name: 'greet',
  args: {
    name: { type: 'string', description: 'Name to greet' }
  },
  resource: async (ctx) => ({
    description: 'Greet someone',
    'arg:name': 'The name to greet'
  }),
  run: async (ctx) => {
    console.log(`Hello, ${ctx.values.name}!`)
  }
})
```
