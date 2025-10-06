[**@gunshi/plugin-i18n**](../index.md)

***

[@gunshi/plugin-i18n](../index.md) / defineI18n

# Function: defineI18n()

```ts
function defineI18n<G, A, C>(definition): { [K in string | number | symbol]: (Omit<C, "resource"> & ("resource" extends keyof C ? { resource: CommandResourceFetcher<{ args: A; extensions: ExtractExtensions<G> }> } : { resource?: CommandResourceFetcher<{ args: A; extensions: ExtractExtensions<G> }> }) & { [K in "name" | "entry" | "description" | "run" | "args" | "examples" | "toKebab" | "internal" | "rendering"]?: I18nCommand<{ args: A; extensions: ExtractExtensions<G> }>[K] })[K] };
```

Define an i18n-aware [command](../interfaces/I18nCommand.md).

The difference from the define function is that you can define a `resource` option that can load a locale.

## Type Parameters

| Type Parameter | Default type | Description |
| ------ | ------ | ------ |
| `G` *extends* `GunshiParamsConstraint` | `DefaultGunshiParams` | A `GunshiParamsConstraint` type |
| `A` *extends* `Args` | `ExtractArgs`\<`G`\> | An `Args` type extracted from `GunshiParamsConstraint` |
| `C` | `object` | The inferred command type |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `definition` | `C` & `object` & `Omit`\<[`I18nCommand`](../interfaces/I18nCommand.md)\<\{ `args`: `A`; `extensions`: `ExtractExtensions`\<`G`\>; \}\>, `"args"` \| `"resource"`\> & `object` | A [command](../interfaces/I18nCommand.md) definition with i18n support |

## Returns

\{ \[K in string \| number \| symbol\]: (Omit\<C, "resource"\> & ("resource" extends keyof C ? \{ resource: CommandResourceFetcher\<\{ args: A; extensions: ExtractExtensions\<G\> \}\> \} : \{ resource?: CommandResourceFetcher\<\{ args: A; extensions: ExtractExtensions\<G\> \}\> \}) & \{ \[K in "name" \| "entry" \| "description" \| "run" \| "args" \| "examples" \| "toKebab" \| "internal" \| "rendering"\]?: I18nCommand\<\{ args: A; extensions: ExtractExtensions\<G\> \}\>\[K\] \})\[K\] \}

A defined [command](../interfaces/I18nCommand.md) with compatible `Command` type

## Example

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
