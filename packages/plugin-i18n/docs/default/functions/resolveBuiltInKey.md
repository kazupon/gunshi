# Function: resolveBuiltInKey()

Resolve a namespaced key for built-in resources.

Built-in keys are prefixed with "_:".

## Signature

```ts
declare function resolveBuiltInKey<K extends string = CommandBuiltinResourceKeys>(key: K): GenerateNamespacedKey<K>
```

## Type Parameters

| Name | Description |
| --- | --- |
| `K` *extends* `string` = `CommandBuiltinResourceKeys` | The type of the built-in key to resolve. Defaults to command built-in argument and resource keys. |

## Parameters

| Name | Type | Description |
| --- | --- | --- |
| `key` | `K` | The built-in key to resolve. |

## Returns

`GenerateNamespacedKey<K>` — Prefixed built-in key.
