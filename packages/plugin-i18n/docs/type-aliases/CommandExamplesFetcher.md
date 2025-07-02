[**@gunshi/plugin-i18n**](../index.md)

---

[@gunshi/plugin-i18n](../index.md) / CommandExamplesFetcher

# Type Alias: CommandExamplesFetcher()\<G\>

```ts
type CommandExamplesFetcher<G> = (ctx) => Awaitable<string>
```

Command examples fetcher.

## Type Parameters

| Type Parameter                         | Default type          |
| -------------------------------------- | --------------------- |
| `G` _extends_ `GunshiParamsConstraint` | `DefaultGunshiParams` |

## Parameters

| Parameter | Type                                  | Description                         |
| --------- | ------------------------------------- | ----------------------------------- |
| `ctx`     | `Readonly`\<`CommandContext`\<`G`\>\> | A CommandContext \| command context |

## Returns

`Awaitable`\<`string`\>

A fetched command examples.
