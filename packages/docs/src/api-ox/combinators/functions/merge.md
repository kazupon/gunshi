# merge

Compose multiple [Args](/api-ox/default/interfaces/Args.md) schemas into one.

## Signature

```ts
declare function merge<T extends Args[]>(...schemas: T): MergeArgs<T>
```

## Type Parameters

| Name                   | Description |
| ---------------------- | ----------- |
| `T` _extends_ `Args[]` |             |

## Parameters

| Name      | Type | Description           |
| --------- | ---- | --------------------- |
| `schemas` | `T`  | The schemas to merge. |

## Returns

`MergeArgs<T>` — A merged schema containing all fields.

## Tags

- `@experimental`
