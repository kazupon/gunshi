# Function: resolveArgs()

Resolve command line arguments.

## Signature

```ts
declare function resolveArgs<A extends Args>(
  args: A,
  tokens: ArgToken[],
  { shortGrouping, skipPositional, toKebab }?: ResolveArgs
): {
  values: ArgValues<A>
  positionals: string[]
  rest: string[]
  error: AggregateError | undefined
  explicit: ArgExplicitlyProvided<A>
}
```

## Type Parameters

| Name                                                       | Description                                                                                                  |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `A` _extends_ [`Args`](/api-ox/default/interfaces/Args.md) | [Arguments](/api-ox/default/interfaces/Args.md), which is an object that defines the command line arguments. |

## Parameters

| Name          | Type                                                     | Description                                                                             |
| ------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `args`        | `A`                                                      | An arguments that contains [arguments schema](/api-ox/default/interfaces/ArgSchema.md). |
| `tokens`      | [`ArgToken`](/api-ox/default/interfaces/ArgToken.md)\[\] | An array of [tokens](/api-ox/default/interfaces/ArgToken.md).                           |
| `resolveArgs` | `unknown`                                                | An arguments that contains resolve arguments.                                           |
| `param`       | `ResolveArgs`                                            | _optional_                                                                              |

## Returns

`{ ... }` — An object that contains the values of the arguments, positional arguments, rest arguments, validation errors, and explicit provision status.

## Examples

```typescript
// passed tokens: --port 3000

const { values, explicit } = resolveArgs(
  {
    port: {
      type: 'number',
      default: 8080
    },
    host: {
      type: 'string',
      default: 'localhost'
    }
  },
  parsedTokens
)

values.port // 3000
values.host // 'localhost'

explicit.port // true (explicitly provided)
explicit.host // false (not provided, fallback to default)
```
