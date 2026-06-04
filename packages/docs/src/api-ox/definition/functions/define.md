# Function: define()

Define a [command](/api-ox/default/interfaces/Command.md).

## Signature

```ts
export function define<
  G extends GunshiParamsConstraint = DefaultGunshiParams,
  A extends Args = ExtractArgs<G>,
  C extends Partial<Command<{ args: A; extensions: ExtractExtensions<G> }>> = {}
>(definition: CommandDefinition<A, ExtractExtensions<G>, C>): CommandDefinitionResult<G, C>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/definition.ts#L121-L125)

## Type Parameters

| Name                                                                                                                                                                                       | Description                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `G` _extends_ [`GunshiParamsConstraint`](/api-ox/default/type-aliases/GunshiParamsConstraint.md) = [`DefaultGunshiParams`](/api-ox/default/type-aliases/DefaultGunshiParams.md)            | A [GunshiParamsConstraint](/api-ox/default/type-aliases/GunshiParamsConstraint.md) type                                                                |
| `A` _extends_ [`Args`](/api-ox/default/interfaces/Args.md) = `ExtractArgs<G>`                                                                                                              | An [Args](/api-ox/default/interfaces/Args.md) type extracted from [GunshiParamsConstraint](/api-ox/default/type-aliases/GunshiParamsConstraint.md)     |
| `C` _extends_ `Partial`\<[`Command`](/api-ox/default/interfaces/Command.md)\<{ [`args`](/api-ox/combinators/functions/args.md): `A`; `extensions`: `ExtractExtensions`\<`G`\> }\>\> = `{}` | A [Command](/api-ox/default/interfaces/Command.md) type inferred from [GunshiParamsConstraint](/api-ox/default/type-aliases/GunshiParamsConstraint.md) |

## Parameters

| Name         | Type                                            | Description                                                   |
| ------------ | ----------------------------------------------- | ------------------------------------------------------------- |
| `definition` | `CommandDefinition<A, ExtractExtensions<G>, C>` | A [command](/api-ox/default/interfaces/Command.md) definition |

## Returns

`CommandDefinitionResult<G, C>` — A defined [command](/api-ox/default/interfaces/Command.md)

## Examples

```ts
const command = define({
  name: 'test',
  description: 'A test command',
  args: {
    debug: {
      type: 'boolean',
      description: 'Enable debug mode',
      default: false
    }
  },
  run: ctx => {
    if (ctx.values.debug) {
      console.debug('Debug mode is enabled')
    }
  }
})
```
