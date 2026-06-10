# Interface: I18nCommand&lt;G&gt;

I18n-aware command interface that extends the base Command with resource support

## Extends

- `Command<G>`

## Signature

```ts
export interface I18nCommand<
  G extends GunshiParamsConstraint = DefaultGunshiParams
> extends Command<G>
```

## Type Parameters

| Name | Description |
| --- | --- |
| `G` *extends* `GunshiParamsConstraint` = `DefaultGunshiParams` | Type parameter extending `GunshiParams` |

## Properties

| Name | Type | Description |
| --- | --- | --- |
| `resource` _(optional)_ | [`CommandResourceFetcher`](/packages/plugin-i18n/docs/default/type-aliases/CommandResourceFetcher.md)\<`G`\> | Command resource fetcher for i18n support. This property is specific to i18n-enabled commands. |

### resource Parameters

| Name | Type | Description |
| --- | --- | --- |
| `locale` | `Intl.Locale` |  |

### resource Returns

`Awaitable`\<[`CommandResource`](/packages/plugin-i18n/docs/default/type-aliases/CommandResource.md)\<`G`\>\>
