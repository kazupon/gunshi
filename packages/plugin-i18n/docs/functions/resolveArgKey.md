[**@gunshi/plugin-i18n**](../index.md)

***

[@gunshi/plugin-i18n](../index.md) / resolveArgKey

# Function: resolveArgKey()

```ts
function resolveArgKey<A, K>(key, name?): string;
```

Resolve a namespaced key for argument resources.
Argument keys are prefixed with "arg:".
If the command name is provided, it will be prefixed with the command name (e.g. "cmd1:arg:foo").

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `A` *extends* `Args` | `Args` |
| `K` *extends* `string` | `KeyOfArgs`\<`RemoveIndexSignature`\<\{ \[K in string \| number \| symbol\]: A\[K\] \}\>\> |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `K` | The argument key to resolve. |
| `name?` | `string` | The command name. |

## Returns

`string`

Prefixed argument key.
