[**@gunshi/plugin-i18n**](../index.md)

***

[@gunshi/plugin-i18n](../index.md) / withI18nResource

# Function: withI18nResource()

```ts
function withI18nResource<G, C>(command, resource): { [K in string | number | symbol]: (C & { resource: CommandResourceFetcher<G> } & { [K in "entry" | "name" | "description" | "run" | "args" | "examples" | "toKebab" | "internal" | "rendering"]?: I18nCommand<G>[K] })[K] };
```

Add i18n resource to an existing command

## Type Parameters

| Type Parameter |
| ------ |
| `G` *extends* `GunshiParamsConstraint` |
| `C` *extends* `Command`\<`G`\> |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `command` | `C` | A defined Command \| command with define function |
| `resource` | [`CommandResourceFetcher`](../type-aliases/CommandResourceFetcher.md)\<`G`\> | A [resource fetcher](../type-aliases/CommandResourceFetcher.md) for the command |

## Returns

\{ \[K in string \| number \| symbol\]: (C & \{ resource: CommandResourceFetcher\<G\> \} & \{ \[K in "entry" \| "name" \| "description" \| "run" \| "args" \| "examples" \| "toKebab" \| "internal" \| "rendering"\]?: I18nCommand\<G\>\[K\] \})\[K\] \}

A [command](../interfaces/I18nCommand.md) with i18n resource support

## Example

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

const i18nCommand = withI18nResource(basicCommand, async locale => {
  const resource = await import(
    `./path/to/resources/test/${locale.toString()}.json`,
    { with: { type: 'json' } }
  ).then(l => l.default || l)
  return resource
})
```
