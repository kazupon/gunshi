# Function: defineI18n()

Define an i18n-aware [command](/packages/plugin-i18n/docs/default/interfaces/I18nCommand.md).

The difference from the `define` function is that you can define a `resource` option that can load a locale.

## Signature

```ts
export function defineI18n<
  G extends GunshiParamsConstraint = DefaultGunshiParams,
  A extends Args = ExtractArgs<G>,
  C = {}
>(definition: C & { args?: A } & Omit<
      I18nCommand<{ args: A; extensions: ExtractExtensions<G> }>,
      'resource' | 'args'
    > & { resource?: CommandResourceFetcher<{ args: A; extensions: ExtractExtensions<G> }> }): I18nCommandDefinitionResult<{ args: A; extensions: ExtractExtensions<G> }, C>
```

## Type Parameters

| Name | Description |
| --- | --- |
| `G` *extends* `GunshiParamsConstraint` = `DefaultGunshiParams` | A `GunshiParamsConstraint` type |
| `A` *extends* `Args` = `ExtractArgs<G>` | An `Args` type extracted from `GunshiParamsConstraint` |
| `C` = `{}` | The inferred command type |

## Parameters

| Name | Type | Description |
| --- | --- | --- |
| `definition` | `C` & { `args`?: `A` } & `Omit`\<[`I18nCommand`](/packages/plugin-i18n/docs/default/interfaces/I18nCommand.md)\<{ `args`: `A`; `extensions`: `ExtractExtensions`\<`G`\> }\>, 'resource' \| 'args'\> & { `resource`?: [`CommandResourceFetcher`](/packages/plugin-i18n/docs/default/type-aliases/CommandResourceFetcher.md)\<{ `args`: `A`; `extensions`: `ExtractExtensions`\<`G`\> }\> } | A [command](/packages/plugin-i18n/docs/default/interfaces/I18nCommand.md) definition with i18n support |

## Returns

`I18nCommandDefinitionResult<{ args: A; extensions: ExtractExtensions<G> }, C>` — A defined [command](/packages/plugin-i18n/docs/default/interfaces/I18nCommand.md) with compatible `Command` type

## Examples

```ts
import { defineI18n } from '@gunshi/plugin-i18n'

const greetCommand = defineI18n({
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
    console.log(`Hello, ${ctx.values.name}!`)
  }
})
```
