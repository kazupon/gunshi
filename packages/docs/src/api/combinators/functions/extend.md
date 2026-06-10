# Function: extend()

> [!WARNING]
> This API is experimental and may change in future versions.

Extend a schema by overriding or adding fields.

Equivalent to `merge(base, overrides)` but communicates the intent of
intentional overrides rather than general composition.

## Signature

```ts
declare function extend<T extends Args, U extends Args>(base: T, overrides: U): Omit<T, keyof U> & U
```

## Type Parameters

| Name | Description |
| --- | --- |
| `T` *extends* [`Args`](/api/default/interfaces/Args.md) | Base schema type. |
| `U` *extends* [`Args`](/api/default/interfaces/Args.md) | Overrides schema type. |

## Parameters

| Name | Type | Description |
| --- | --- | --- |
| `base` | `T` | The base schema to extend. |
| `overrides` | `U` | Fields to override or add. |

## Returns

`Omit<T, keyof U> & U` — A new schema with overrides applied.

## Examples

```ts
const base = args({ port: withDefault(integer(), 8080) })
const strict = extend(base, { port: required(integer({ min: 1, max: 65535 })) })
```
