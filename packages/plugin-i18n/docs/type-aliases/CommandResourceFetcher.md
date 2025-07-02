[**@gunshi/plugin-i18n**](../index.md)

---

[@gunshi/plugin-i18n](../index.md) / CommandResourceFetcher

# Type Alias: CommandResourceFetcher()\<G\>

```ts
type CommandResourceFetcher<G> = (ctx) => Awaitable<CommandResource<G>>
```

Command resource fetcher.

## Type Parameters

| Type Parameter                         | Default type          |
| -------------------------------------- | --------------------- |
| `G` _extends_ `GunshiParamsConstraint` | `DefaultGunshiParams` |

## Parameters

| Parameter | Type                                  | Description                         |
| --------- | ------------------------------------- | ----------------------------------- |
| `ctx`     | `Readonly`\<`CommandContext`\<`G`\>\> | A CommandContext \| command context |

## Returns

`Awaitable`\<[`CommandResource`](CommandResource.md)\<`G`\>\>

A fetched [command resource](CommandResource.md).
