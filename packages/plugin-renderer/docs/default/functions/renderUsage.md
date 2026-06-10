# Function: renderUsage()

Render the usage.

## Signature

```ts
export async function renderUsage<G extends GunshiParams = DefaultGunshiParams>(ctx: Readonly<CommandContext<G>>): Promise<string>
```

## Type Parameters

| Name |
| --- |
| `G` *extends* `GunshiParams` = `DefaultGunshiParams` |

## Parameters

| Name | Type | Description |
| --- | --- | --- |
| `ctx` | `Readonly<CommandContext<G>>` | A command context |

## Returns

`Promise<string>` — A rendered usage.
