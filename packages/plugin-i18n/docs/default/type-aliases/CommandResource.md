# Type Alias: CommandResource&lt;G&gt;

Command resource type for i18n plugin.

## Signature

```ts
export type CommandResource<G extends GunshiParamsConstraint = DefaultGunshiParams> = { description: string } & { [Arg in GenerateNamespacedKey<KeyOfArgs<RemovedIndex<ExtractArgs<G>>>, typeof ARG_PREFIX>]?: string } & { [key: string]: string }
```

## Type Parameters

| Name | Description |
| --- | --- |
| `G` *extends* `GunshiParamsConstraint` = `DefaultGunshiParams` | Type parameter extending `GunshiParams` |

## Indexable

```ts
[key: string]: string
```

## Properties

| Name | Type | Description |
| --- | --- | --- |
| `description` | `string` | Command description. |
