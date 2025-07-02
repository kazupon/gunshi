[**@gunshi/plugin-i18n**](../index.md)

***

[@gunshi/plugin-i18n](../index.md) / withI18nResource

# Function: withI18nResource()

```ts
function withI18nResource<G>(command, resource): I18nCommand<G>;
```

Add i18n resource to an existing command

## Type Parameters

| Type Parameter |
| ------ |
| `G` *extends* `GunshiParamsConstraint` |

## Parameters

| Parameter | Type |
| ------ | ------ |
| `command` | `Command`\<`G`\> |
| `resource` | [`CommandResourceFetcher`](../type-aliases/CommandResourceFetcher.md)\<`G`\> |

## Returns

[`I18nCommand`](../interfaces/I18nCommand.md)\<`G`\>

## Example

```ts
import { define } from '@gunshi/definition'
import { withI18nResource } from '@gunshi/plugin-i18n'

const myCommand = define({
  name: 'myCommand',
  args: {
    input: { type: 'string', description: 'Input value' }
  },
  run: async (ctx) => {
    console.log(`Input: ${ctx.values.input}`)
  }
})

const i18nCommand = withI18nResource(basicCommand, async ctx => {
  const resource = await import(
    `./path/to/resources/test/${ctx.extensions['g:i18n'].locale.toString()}.json`,
    { with: { type: 'json' } }
  ).then(l => l.default || l)
  return resource
})
```
