# Type Alias: CommandResourceFetcher&lt;G&gt;

Command resource fetcher.

## Signature

```ts
export type CommandResourceFetcher<G extends GunshiParamsConstraint = DefaultGunshiParams> = (locale: Intl.Locale) => Awaitable<CommandResource<G>>
```

## Type Parameters

| Name | Description |
| --- | --- |
| `G` *extends* `GunshiParamsConstraint` = `DefaultGunshiParams` | Type parameter extending `GunshiParams` |

## Parameters

| Name | Type | Description |
| --- | --- | --- |
| `locale` | `Intl.Locale` | A locale at the time of command execution. |

## Returns

`Awaitable`\<[`CommandResource`](/packages/plugin-i18n/docs/default/type-aliases/CommandResource.md)\<`G`\>\> — A fetched [command resource](/packages/plugin-i18n/docs/default/type-aliases/CommandResource.md).
