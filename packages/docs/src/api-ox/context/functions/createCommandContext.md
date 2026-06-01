# createCommandContext

Create a command context.

## Signature

```ts
export async function createCommandContext<
  G extends GunshiParamsConstraint = DefaultGunshiParams,
  V extends ArgValues<ExtractArgs<G>> = ArgValues<ExtractArgs<G>>,
  C extends Command<G> | LazyCommand<G> = Command<G>,
  E extends Record<string, CommandContextExtension> = {}
>({
  args = {} as ExtractArgs<G>,
  explicit = {} as ExtractArgExplicitlyProvided<G>,
  values = {} as V,
  positionals = [],
  rest = [],
  argv = [],
  tokens = [],
  command = {} as C,
  extensions = {} as E,
  cliOptions = {} as CliOptions<G>,
  callMode = 'entry',
  commandPath = [],
  omitted = false,
  validationError
}: CommandContextParams<G, V, C, E>): Promise<CommandContextResult<G, E>>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/context.ts#L143-L243)

## Type Parameters

| Name                                                                    | Description |
| ----------------------------------------------------------------------- | ----------- |
| `G` _extends_ `GunshiParamsConstraint` = `DefaultGunshiParams`          |             |
| `V` _extends_ `ArgValues<ExtractArgs<G>>` = `ArgValues<ExtractArgs<G>>` |             |
| `C` _extends_ `Command<G> \| LazyCommand<G>` = `Command<G>`             |             |
| `E` _extends_ `Record<string, CommandContextExtension>` = `{}`          |             |

## Parameters

| Name    | Type                               | Description                                                                                     |
| ------- | ---------------------------------- | ----------------------------------------------------------------------------------------------- |
| `param` | `CommandContextParams<G, V, C, E>` | A [parameters](/api-ox/context/interfaces/CommandContextParams.md) to create a command context. |

## Returns

`Promise<CommandContextResult<G, E>>` — A [command context](/api-ox/default/interfaces/CommandContext.md), which is readonly.
