# Function: resolveKey()

Resolve a namespaced key for non-built-in resources.

Non-built-in keys are not prefixed with any special characters. If the command name is provided, it will be prefixed with the command name (e.g. "cmd1:foo").

## Signature

```ts
declare function resolveKey<T extends Record<string, string> = {}, K extends string = (keyof T extends string ? keyof T : string)>(key: K, name?: string): string
```

## Type Parameters

| Name | Description |
| --- | --- |
| `T` *extends* `Record<string, string>` = `{}` | The type of the non-built-in key to resolve. Defaults to string. |
| `K` *extends* `string` = `(keyof T extends string ? keyof T : string)` | - |

## Parameters

| Name | Type | Description |
| --- | --- | --- |
| `key` | `K` | The non-built-in key to resolve. |
| `name` | `string` | The command name. _(optional)_ |

## Returns

`string` — Prefixed non-built-in key.
