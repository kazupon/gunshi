[**@gunshi/plugin-i18n**](../index.md)

***

[@gunshi/plugin-i18n](../index.md) / CommandResource

# Type Alias: CommandResource\<G\>

```ts
type CommandResource<G> = object & { [Arg in GenerateNamespacedKey<KeyOfArgs<RemovedIndex<ExtractArgs<G>>>, typeof ARG_PREFIX>]?: string } & object;
```

Command resource type for i18n plugin.

## Type Declaration

### description

```ts
description: string;
```

Command description.

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `G` *extends* `GunshiParamsConstraint` | `DefaultGunshiParams` |
