# Interface: ArgSchema

An argument schema definition for command-line argument parsing.

This schema is similar to the schema of Node.js `util.parseArgs` but with extended features:

- Additional `required` and `description` properties
- Extended `type` support: 'string', 'boolean', 'number', 'enum', 'positional', 'custom'
- Simplified `default` property (single type, not union types)

## Signature

```ts
interface ArgSchema
```

## Properties

| Name                       | Type                                                                                                                                                                | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `choices` _(optional)_     | [`string`](/api-ox/combinators/functions/string.md)\[\] \| `unknown`                                                                                                | Array of allowed string values for enum-type arguments. Required when `type: 'enum'`. The argument value must be one of these choices, otherwise an `ArgResolveError` with type 'type' will be thrown. Supports both mutable arrays and readonly arrays for type safety.                                                                                                                                                                                                                                                                                                                               |
| `conflicts` _(optional)_   | [`string`](/api-ox/combinators/functions/string.md) \| [`string`](/api-ox/combinators/functions/string.md)\[\]                                                      | Names of other options that conflict with this option. When this option is used together with any of the conflicting options, an `ArgResolveError` with type 'conflict' will be thrown. Conflicts only need to be defined on one side - if option A defines a conflict with option B, the conflict is automatically detected when both are used, regardless of whether B also defines a conflict with A. Supports both single option name or array of option names. Option names must match the property keys in the schema object exactly (no automatic conversion between camelCase and kebab-case). |
| `default` _(optional)_     | [`string`](/api-ox/combinators/functions/string.md) \| [`boolean`](/api-ox/combinators/functions/boolean.md) \| [`number`](/api-ox/combinators/functions/number.md) | Default value used when the argument is not provided. The type must match the argument's `type` property: - `string` type: string default - `boolean` type: boolean default - `number` type: number default - `enum` type: must be one of the `choices` values - `positional`/`custom` type: any appropriate default                                                                                                                                                                                                                                                                                   |
| `description` _(optional)_ | [`string`](/api-ox/combinators/functions/string.md)                                                                                                                 | Human-readable description of the argument's purpose. Used for help text generation and documentation. Should be concise but descriptive enough to understand the argument's role.                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `metavar` _(optional)_     | [`string`](/api-ox/combinators/functions/string.md)                                                                                                                 | Display name hint for help text generation. Provides a meaningful type hint for the argument value in help output. Particularly useful for `type: 'custom'` arguments where the type name would otherwise be unhelpful.                                                                                                                                                                                                                                                                                                                                                                                |
| `multiple` _(optional)_    | `true`                                                                                                                                                              | Allows the argument to accept multiple values. When `true`, the resolved value becomes an array. For options: can be specified multiple times (--tag foo --tag bar) For positional: collects remaining positional arguments Note: Only `true` is allowed (not `false`) to make intent explicit.                                                                                                                                                                                                                                                                                                        |
| `negatable` _(optional)_   | [`boolean`](/api-ox/combinators/functions/boolean.md)                                                                                                               | Enables negation for boolean arguments using `--no-` prefix. When `true`, allows users to explicitly set the boolean to `false` using `--no-option-name`. When `false` or omitted, only positive form is available. Only applicable to `type: 'boolean'` arguments.                                                                                                                                                                                                                                                                                                                                    |
| `parse` _(optional)_       | (`value`: [`string`](/api-ox/combinators/functions/string.md)) =\> `any`                                                                                            | Custom parsing function for `type: 'custom'` arguments. Required when `type: 'custom'`. Receives the raw string value and must return the parsed result. Should throw an Error (or subclass) if parsing fails. The function's return type becomes the resolved argument type. Returns: Parsed value of any type                                                                                                                                                                                                                                                                                        |
| `required` _(optional)_    | [`boolean`](/api-ox/combinators/functions/boolean.md)                                                                                                               | Marks the argument as required. When `true`, the argument must be provided by the user. If missing, an `ArgResolveError` with type 'required' will be thrown. Note: Only `true` is allowed (not `false`) to make intent explicit.                                                                                                                                                                                                                                                                                                                                                                      |
| `short` _(optional)_       | [`string`](/api-ox/combinators/functions/string.md)                                                                                                                 | Single character alias for the long option name. As example, allows users to use `-x` instead of `--extended-option`. Only valid for non-positional argument types.                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `toKebab` _(optional)_     | `true`                                                                                                                                                              | Converts the argument name from camelCase to kebab-case for CLI usage. When `true`, a property like `maxCount` becomes available as `--max-count`. This allows [CAC](https://github.com/cacjs/cac) user-friendly property names while maintaining CLI conventions. Can be overridden globally with `resolveArgs({ toKebab: true })`. Note: Only `true` is allowed (not `false`) to make intent explicit.                                                                                                                                                                                               |
| `type`                     | `"string" \| "boolean" \| "number" \| "enum" \| "positional" \| "custom"`                                                                                           | Type of the argument value. - `'string'`: Text value (default if not specified) - `'boolean'`: `true`/`false` flag (can be negatable with `--no-` prefix) - `'number'`: Numeric value (parsed as integer or float) - `'enum'`: One of predefined string values (requires `choices` property) - `'positional'`: Non-option argument by position - `'custom'`: Custom parsing with user-defined `parse` function                                                                                                                                                                                         |

### parse Parameters

| Name    | Type      | Description                        |
| ------- | --------- | ---------------------------------- |
| `value` | `unknown` | Raw string value from command line |

## Examples

````ts
Basic string argument:
```ts
const schema: ArgSchema = {
  type: 'string',
  description: 'Server hostname',
  default: 'localhost'
}
````

````

```ts
Required number argument with alias:
```ts
const schema: ArgSchema = {
  type: 'number',
  short: 'p',
  description: 'Port number to listen on',
  required: true
}
````

````

```ts
Enum argument with choices:
```ts
const schema: ArgSchema = {
  type: 'enum',
  choices: ['info', 'warn', 'error'],
  description: 'Logging level',
  default: 'info'
}
````

```

```
