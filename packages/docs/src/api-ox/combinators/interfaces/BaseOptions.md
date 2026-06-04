# Interface: BaseOptions

> [!WARNING]
> This API is experimental and may change in future versions.

Common options shared by all base combinators.

## Signature

```ts
interface BaseOptions
```

## Properties

| Name                       | Type                                                  | Description                                          |
| -------------------------- | ----------------------------------------------------- | ---------------------------------------------------- |
| `description` _(optional)_ | [`string`](/api-ox/combinators/functions/string.md)   | Human-readable description for help text generation. |
| `required` _(optional)_    | [`boolean`](/api-ox/combinators/functions/boolean.md) | Mark as required.                                    |
| `short` _(optional)_       | [`string`](/api-ox/combinators/functions/string.md)   | Single character short alias.                        |
