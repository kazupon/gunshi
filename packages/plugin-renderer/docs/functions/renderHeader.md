[**@gunshi/plugin-renderer**](../index.md)

---

[@gunshi/plugin-renderer](../index.md) / renderHeader

# Function: renderHeader()

```ts
function renderHeader<G>(ctx): Promise<string>
```

Render the header.

## Type Parameters

| Type Parameter                                                             | Default type          |
| -------------------------------------------------------------------------- | --------------------- |
| `G` _extends_ `GunshiParams`\<\{ `args`: `Args`; `extensions`: \{ \}; \}\> | `DefaultGunshiParams` |

## Parameters

| Parameter | Type                                  | Description                         |
| --------- | ------------------------------------- | ----------------------------------- |
| `ctx`     | `Readonly`\<`CommandContext`\<`G`\>\> | A CommandContext \| command context |

## Returns

`Promise`\<`string`\>

A rendered header.
