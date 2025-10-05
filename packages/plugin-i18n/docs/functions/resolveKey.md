[**@gunshi/plugin-i18n**](../index.md)

***

[@gunshi/plugin-i18n](../index.md) / resolveKey

# Function: resolveKey()

```ts
function resolveKey<T, K>(key, name?): string;
```

Resolve a namespaced key for non-built-in resources.
Non-built-in keys are not prefixed with any special characters. If the command name is provided, it will be prefixed with the command name (e.g. "cmd1:foo").

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` *extends* `Record`\<`string`, `string`\> | `object` |
| `K` | keyof `T` *extends* `string` ? keyof `any` : `string` |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `K` | The non-built-in key to resolve. |
| `name?` | `string` | The command name. |

## Returns

`string`

Prefixed non-built-in key.
