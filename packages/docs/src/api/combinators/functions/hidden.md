# Function: hidden()

> [!WARNING]
> This API is experimental and may change in future versions.

Hide a combinator schema from generated help or usage output.

The original schema is not modified. This only marks renderer metadata and
does not change parsing, validation, defaults, conflicts, or resolved values.

## Signature

```ts
declare function hidden<T extends ArgSchema>(schema: T): Omit<T, 'hidden'> & CombinatorHidden
```

## Type Parameters

| Name | Description |
| --- | --- |
| `T` *extends* [`ArgSchema`](/api/default/interfaces/ArgSchema.md) | The schema type. |

## Parameters

| Name | Type | Description |
| --- | --- | --- |
| `schema` | `T` | The base combinator schema. |

## Returns

`Omit<T, 'hidden'> & CombinatorHidden` — A new schema with `hidden: true`.

## Examples

```ts
const args = {
  legacy: hidden(string())
}
```
