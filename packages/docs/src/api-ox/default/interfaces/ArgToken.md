# Interface: ArgToken

Argument token.

## Signature

```ts
interface ArgToken
```

## Properties

| Name                       | Type                                                  | Description                                                                                                                                                             |
| -------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index`                    | [`number`](/api-ox/combinators/functions/number.md)   | Argument token index, e.g `--foo bar` => `--foo` index is 0, `bar` index is 1.                                                                                          |
| `inlineValue` _(optional)_ | [`boolean`](/api-ox/combinators/functions/boolean.md) | Inline value, e.g. `--foo=bar` => `true`, `-x=bar` => `true`.                                                                                                           |
| `kind`                     | `ArgTokenKind`                                        | Argument token kind.                                                                                                                                                    |
| `name` _(optional)_        | [`string`](/api-ox/combinators/functions/string.md)   | Option name, e.g. `--foo` => `foo`, `-x` => `x`.                                                                                                                        |
| `rawName` _(optional)_     | [`string`](/api-ox/combinators/functions/string.md)   | Raw option name, e.g. `--foo` => `--foo`, `-x` => `-x`.                                                                                                                 |
| `value` _(optional)_       | [`string`](/api-ox/combinators/functions/string.md)   | Option value, e.g. `--foo=bar` => `bar`, `-x=bar` => `bar`. If the `allowCompatible` option is `true`, short option value will be same as Node.js `parseArgs` behavior. |
