# ArgToken

Argument token.

## Signature

```ts
interface ArgToken
```

## Properties

| Name                       | Kind     | Type           | Description                                                                                                                                                             |
| -------------------------- | -------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`                     | property | `ArgTokenKind` | Argument token kind.                                                                                                                                                    |
| `index`                    | property | `number`       | Argument token index, e.g `--foo bar` => `--foo` index is 0, `bar` index is 1.                                                                                          |
| `name` _(optional)_        | property | `string`       | Option name, e.g. `--foo` => `foo`, `-x` => `x`.                                                                                                                        |
| `rawName` _(optional)_     | property | `string`       | Raw option name, e.g. `--foo` => `--foo`, `-x` => `-x`.                                                                                                                 |
| `value` _(optional)_       | property | `string`       | Option value, e.g. `--foo=bar` => `bar`, `-x=bar` => `bar`. If the `allowCompatible` option is `true`, short option value will be same as Node.js `parseArgs` behavior. |
| `inlineValue` _(optional)_ | property | `boolean`      | Inline value, e.g. `--foo=bar` => `true`, `-x=bar` => `true`.                                                                                                           |
