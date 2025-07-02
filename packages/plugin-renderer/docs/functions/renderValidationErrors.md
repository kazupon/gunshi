[**@gunshi/plugin-renderer**](../index.md)

***

[@gunshi/plugin-renderer](../index.md) / renderValidationErrors

# Function: renderValidationErrors()

```ts
function renderValidationErrors<G>(_ctx, error): Promise<string>;
```

Render the validation errors.

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `G` *extends* `GunshiParams`\<\{ `args`: `Args`; `extensions`: \{ \}; \}\> | `DefaultGunshiParams` |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `_ctx` | `CommandContext`\<`G`\> | - |
| `error` | `AggregateError` | An AggregateError of option in `args-token` validation |

## Returns

`Promise`\<`string`\>

A rendered validation error.
