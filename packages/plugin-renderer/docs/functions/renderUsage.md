[**@gunshi/plugin-renderer**](../index.md)

***

[@gunshi/plugin-renderer](../index.md) / renderUsage

# Function: renderUsage()

```ts
function renderUsage<G>(ctx): Promise<string>;
```

Render the usage.

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `G` *extends* `GunshiParams`\<\{ `args`: `Args`; `extensions`: \{ \}; \}\> | `DefaultGunshiParams` |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `ctx` | `Readonly`\<`CommandContext`\<`G`\>\> | A CommandContext \| command context |

## Returns

`Promise`\<`string`\>

A rendered usage.
