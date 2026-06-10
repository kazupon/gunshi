# Function: renderValidationErrors()

Render the validation errors.

## Signature

```ts
export function renderValidationErrors<G extends GunshiParams = DefaultGunshiParams>(_ctx: CommandContext<G>, error: AggregateError): Promise<string>
```

## Type Parameters

| Name |
| --- |
| `G` *extends* `GunshiParams` = `DefaultGunshiParams` |

## Parameters

| Name | Type | Description |
| --- | --- | --- |
| `_ctx` | `CommandContext<G>` | A command context |
| `error` | `AggregateError` | An AggregateError of option in `args-token` validation |

## Returns

`Promise<string>` — A rendered validation error.
