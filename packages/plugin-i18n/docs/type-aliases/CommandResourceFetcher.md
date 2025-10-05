[**@gunshi/plugin-i18n**](../index.md)

***

[@gunshi/plugin-i18n](../index.md) / CommandResourceFetcher

# Type Alias: CommandResourceFetcher()\<G\>

```ts
type CommandResourceFetcher<G> = (locale) => Awaitable<CommandResource<G>>;
```

Command resource fetcher.

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `G` *extends* `GunshiParamsConstraint` | `DefaultGunshiParams` |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `locale` | `Intl.Locale` | A Intl.Locale \| locale at the time of command execution. |

## Returns

`Awaitable`\<[`CommandResource`](CommandResource.md)\<`G`\>\>

A fetched [command resource](CommandResource.md).
