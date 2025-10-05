[**@gunshi/plugin-i18n**](../index.md)

***

[@gunshi/plugin-i18n](../index.md) / resolveBuiltInKey

# Function: resolveBuiltInKey()

```ts
function resolveBuiltInKey<K>(key): `_:${K}`;
```

Resolve a namespaced key for built-in resources.
Built-in keys are prefixed with "_:".

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `K` *extends* `string` | \| `"USAGE"` \| `"COMMAND"` \| `"SUBCOMMAND"` \| `"COMMANDS"` \| `"ARGUMENTS"` \| `"OPTIONS"` \| `"EXAMPLES"` \| `"FORMORE"` \| `"NEGATABLE"` \| `"DEFAULT"` \| `"CHOICES"` \| keyof CommonArgType |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `K` | The built-in key to resolve. |

## Returns

`` `_:${K}` ``

Prefixed built-in key.
