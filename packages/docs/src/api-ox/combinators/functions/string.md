# string

Create a string argument schema with optional validation.

## Signature

```ts
declare function string(opts?: StringOptions): CombinatorSchema<string>
```

## Parameters

| Name   | Type            | Description                      |
| ------ | --------------- | -------------------------------- |
| `opts` | `StringOptions` | Validation options. _(optional)_ |

## Returns

`CombinatorSchema<string>` — A combinator schema that resolves to string.

## Examples

```ts
const args = {
  name: string({ minLength: 1, maxLength: 50 })
}
```

## Tags

- `@experimental`
