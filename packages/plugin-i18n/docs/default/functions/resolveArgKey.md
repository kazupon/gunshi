# Function: resolveArgKey()

Resolve a namespaced key for argument resources.

Argument keys are prefixed with "arg:".
If the command name is provided, it will be prefixed with the command name (e.g. "cmd1:arg:foo").

## Signature

```ts
declare function resolveArgKey<A extends Args = DefaultGunshiParams['args'], K extends string = KeyOfArgs<RemovedIndex<A>>>(key: K, name?: string): string
```

## Type Parameters

| Name | Description |
| --- | --- |
| `A` *extends* `Args` = `DefaultGunshiParams['args']` | The `Args` type extracted from G |
| `K` *extends* `string` = `KeyOfArgs<RemovedIndex<A>>` | - |

## Parameters

| Name | Type | Description |
| --- | --- | --- |
| `key` | `K` | The argument key to resolve. |
| `name` | `string` | The command name. _(optional)_ |

## Returns

`string` — Prefixed argument key.
