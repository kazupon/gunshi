# renderValidationErrors

Render the validation errors.

## Signature

```ts
declare function renderValidationErrors<G extends GunshiParams = DefaultGunshiParams>(
  _ctx: CommandContext<G>,
  error: AggregateError
): Promise<string>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/plugin-renderer/lib/index.d.ts#L180)

## Type Parameters

| Name                                                 | Description |
| ---------------------------------------------------- | ----------- |
| `G` _extends_ `GunshiParams` = `DefaultGunshiParams` |             |

## Parameters

| Name    | Type                | Description                                                       |
| ------- | ------------------- | ----------------------------------------------------------------- |
| `_ctx`  | `CommandContext<G>` | A [command context](/api-ox/default/interfaces/CommandContext.md) |
| `error` | `AggregateError`    | An AggregateError of option in `args-token` validation            |

## Returns

`Promise<string>` — A rendered validation error.
