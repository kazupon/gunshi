# Function: lazy()

Define a [lazy command](/api-ox/default/type-aliases/LazyCommand.md) with or without definition.

## Call Signature

```ts
export function lazy<A extends Args>(
  loader: CommandLoader<{ args: A; extensions: {} }>
): LazyCommand<{ args: A; extensions: {} }, {}>
```

Define a [lazy command](/api-ox/default/type-aliases/LazyCommand.md).

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/definition.ts#L217-L219)

### Type Parameters

| Name                                                       | Description                                        |
| ---------------------------------------------------------- | -------------------------------------------------- |
| `A` _extends_ [`Args`](/api-ox/default/interfaces/Args.md) | An [Args](/api-ox/default/interfaces/Args.md) type |

### Parameters

| Name     | Type                                                                                                                                           | Description                                                       |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `loader` | [`CommandLoader`](/api-ox/default/type-aliases/CommandLoader.md)\<{ [`args`](/api-ox/combinators/functions/args.md): `A`; `extensions`: {} }\> | A [command loader](/api-ox/default/type-aliases/CommandLoader.md) |

### Returns

[`LazyCommand`](/api-ox/default/type-aliases/LazyCommand.md)\<{ [`args`](/api-ox/combinators/functions/args.md): `A`; `extensions`: {} }, {}\> — A [lazy command](/api-ox/default/type-aliases/LazyCommand.md) with loader

### Examples

```ts
// load command with dynamic importing
const test = lazy(() => import('./commands/test'))
```

## Call Signature

```ts
export function lazy<
  G extends GunshiParamsConstraint = DefaultGunshiParams,
  A extends ExtractArgs<G> = ExtractArgs<G>,
  D extends Partial<Command<{ args: A; extensions: {} }>> = Partial<
    Command<{ args: A; extensions: {} }>
  >
>(
  loader: CommandLoader<{ args: A; extensions: {} }>,
  definition: D
): LazyCommand<{ args: A; extensions: {} }, D>
```

Define a [lazy command](/api-ox/default/type-aliases/LazyCommand.md) with definition.

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/definition.ts#L256-L265)

### Type Parameters

| Name                                                                                                                                                                            | Description                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `G` _extends_ [`GunshiParamsConstraint`](/api-ox/default/type-aliases/GunshiParamsConstraint.md) = [`DefaultGunshiParams`](/api-ox/default/type-aliases/DefaultGunshiParams.md) |                                                    |
| `A` _extends_ `ExtractArgs<G>` = `ExtractArgs<G>`                                                                                                                               | An [Args](/api-ox/default/interfaces/Args.md) type |

| `D` _extends_ `Partial`\<[`Command`](/api-ox/default/interfaces/Command.md)\<{ [`args`](/api-ox/combinators/functions/args.md): `A`; `extensions`: {} }\>\> = `Partial`\<
[`Command`](/api-ox/default/interfaces/Command.md)\<{ [`args`](/api-ox/combinators/functions/args.md): `A`; `extensions`: {} }\>
\> | A partial [Command](/api-ox/default/interfaces/Command.md) definition type |

### Parameters

| Name         | Type                                                                                                                                           | Description                                                                                                  |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `loader`     | [`CommandLoader`](/api-ox/default/type-aliases/CommandLoader.md)\<{ [`args`](/api-ox/combinators/functions/args.md): `A`; `extensions`: {} }\> | A [command loader](/api-ox/default/type-aliases/CommandLoader.md) function that returns a command definition |
| `definition` | `D`                                                                                                                                            | An optional [command](/api-ox/default/interfaces/Command.md) definition                                      |

### Returns

[`LazyCommand`](/api-ox/default/type-aliases/LazyCommand.md)\<{ [`args`](/api-ox/combinators/functions/args.md): `A`; `extensions`: {} }, `D`\> — A [lazy command](/api-ox/default/type-aliases/LazyCommand.md) that can be executed later

### Examples

```ts
// define command without command runner
const testDefinition = define({
  name: 'test',
  description: 'Test command',
  args: {
    debug: {
      type: 'boolean',
      description: 'Enable debug mode',
      default: false
    }
  }
})

// define load command with command runner and defined command
const test = lazy((): CommandRunner<{ args: typeof testDefinition.args; extensions: {} }> => {
  return ctx => {
    if (ctx.values.debug) {
      console.debug('Debug mode is enabled')
    }
  }
}, testDefinition)
```
