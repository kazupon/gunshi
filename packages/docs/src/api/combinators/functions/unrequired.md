# Function: unrequired()

> [!WARNING]
> This API is experimental and may change in future versions.

Mark a combinator schema as not required.

Useful for overriding a base combinator that was created with `required: true`,
or for making a positional argument explicitly optional.
The original schema is not modified.

## Signature

```ts
declare function unrequired<T extends ArgSchema>(schema: T): Omit<T, 'required'> & CombinatorUnrequired
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

`Omit<T, 'required'> & CombinatorUnrequired` — A new schema with `required: false`.

## Examples

```ts
const args = {
  name: unrequired(string({ required: true })),
  query: unrequired(positional())
}
```
