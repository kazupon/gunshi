# Function: withI18nResource()

Add i18n resource to an existing command

## Signature

```ts
export function withI18nResource<
  G extends GunshiParamsConstraint,
  C extends Command<G> | SubCommandable
>(command: C & UnknownKeys<C, I18nCommand<G> & SubCommandable>, resource: CommandResourceFetcher<G>): WithI18nResourceResult<G, C>
```

## Type Parameters

| Name |
| --- |
| `G` *extends* `GunshiParamsConstraint` |
| `C` *extends* `Command<G> \| SubCommandable` |

## Parameters

| Name | Type | Description |
| --- | --- | --- |
| `command` | `C` & `UnknownKeys`\<`C`, [`I18nCommand`](/packages/plugin-i18n/docs/default/interfaces/I18nCommand.md)\<`G`\> & `SubCommandable`\> | A command defined with `define`, or a lazy command defined with `lazy`, which stays a lazy command |
| `resource` | [`CommandResourceFetcher`](/packages/plugin-i18n/docs/default/type-aliases/CommandResourceFetcher.md)\<`G`\> | A [resource fetcher](/packages/plugin-i18n/docs/default/type-aliases/CommandResourceFetcher.md) for the command |

## Returns

`WithI18nResourceResult<G, C>` — A [command](/packages/plugin-i18n/docs/default/interfaces/I18nCommand.md) with i18n resource support, or a lazy command for a lazy command

## Examples

```ts
import { define } from 'gunshi'
import { withI18nResource } from '@gunshi/plugin-i18n'

const myCommand = define({
  name: 'myCommand',
  args: {
    input: { type: 'string', description: 'Input value' }
  },
  run: ctx => {
    console.log(`Input: ${ctx.values.input}`)
  }
})

const i18nCommand = withI18nResource(myCommand, async locale => {
  const resource = await import(
    `./path/to/resources/test/${locale.toString()}.json`,
    { with: { type: 'json' } }
  ).then(l => l.default || l)
  return resource
})
```
