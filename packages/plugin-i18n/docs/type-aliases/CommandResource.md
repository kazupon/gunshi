[**@gunshi/plugin-i18n**](../index.md)

---

[@gunshi/plugin-i18n](../index.md) / CommandResource

# Type Alias: CommandResource\<G\>

```ts
type CommandResource<G> = object & {
  [Arg in GenerateNamespacedKey<KeyOfArgs<RemovedIndex<ExtractArgs<G>>>, typeof ARG_PREFIX>]: string
} & object
```

Command resource type for i18n plugin.

## Type declaration

### description

```ts
description: string
```

Command description.

### examples

```ts
examples:
  | string
| CommandExamplesFetcher<NormalizeToGunshiParams<G>>;
```

Examples usage.

## Type Parameters

| Type Parameter                         | Default type          |
| -------------------------------------- | --------------------- |
| `G` _extends_ `GunshiParamsConstraint` | `DefaultGunshiParams` |
