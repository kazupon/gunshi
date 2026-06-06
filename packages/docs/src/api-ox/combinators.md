# combinators

**[Source](https://github.com/kazupon/gunshi/blob/main/combinators)**

> 31 documented symbols. Read the signatures first, then expand each item for parameters, return types, and examples.

## Reference

### args

> [!WARNING]
> This API is experimental and may change in future versions.

Type-safe schema factory.

Returns the input unchanged at runtime, but provides type inference
so that `satisfies Args` is not needed.

#### Signature

```ts
declare function args<T extends Args>(fields: T): T
```

#### Type Parameters

| Name                                            | Description            |
| ----------------------------------------------- | ---------------------- |
| `T` _extends_ [`Args`](/api-ox/default.md#args) | The exact schema type. |

#### Parameters

| Name     | Type | Description                 |
| -------- | ---- | --------------------------- |
| `fields` | `T`  | The argument schema object. |

#### Returns

`T` — The same schema object with its type inferred.

#### Examples

```ts
const common = args({
  verbose: boolean(),
  help: short(boolean(), 'h')
})
```

### BaseOptions

> [!WARNING]
> This API is experimental and may change in future versions.

Common options shared by all base combinators.

#### Signature

```ts
interface BaseOptions
```

#### Properties

| Name                       | Type      | Description                                          |
| -------------------------- | --------- | ---------------------------------------------------- |
| `description` _(optional)_ | `string`  | Human-readable description for help text generation. |
| `required` _(optional)_    | `boolean` | Mark as required.                                    |
| `short` _(optional)_       | `string`  | Single character short alias.                        |

### boolean

> [!WARNING]
> This API is experimental and may change in future versions.

Create a boolean argument schema.

Boolean arguments are existence-based. The resolver passes `"true"` or `"false"`
to the parse function based on the presence or negation of the flag.

#### Signature

```ts
declare function boolean(opts?: BooleanOptions): CombinatorSchema<boolean>
```

#### Parameters

| Name   | Type                                | Description                   |
| ------ | ----------------------------------- | ----------------------------- |
| `opts` | [`BooleanOptions`](#booleanoptions) | Boolean options. _(optional)_ |

#### Returns

[`CombinatorSchema`](#combinatorschema)\<`boolean`\> — A combinator schema for boolean flags.

#### Examples

```ts
const args = {
  color: boolean({ negatable: true })
}
// Usage: --color (true), --no-color (false)
```

### BooleanOptions

> [!WARNING]
> This API is experimental and may change in future versions.

Options for the [boolean](#boolean) combinator.

#### Extends

- [`BaseOptions`](#baseoptions)

#### Signature

```ts
interface BooleanOptions extends BaseOptions
```

#### Properties

| Name                     | Type      | Description                          |
| ------------------------ | --------- | ------------------------------------ |
| `negatable` _(optional)_ | `boolean` | Enable negation with `--no-` prefix. |

### choice

> [!WARNING]
> This API is experimental and may change in future versions.

Create an enum-like argument schema with literal type inference.

Uses `const T` generic to infer literal union types from the values array.

#### Signature

```ts
declare function choice<const T extends readonly string[]>(
  values: T,
  opts?: BaseOptions
): CombinatorSchema<T[number]>
```

#### Type Parameters

| Name                              | Description                                  |
| --------------------------------- | -------------------------------------------- |
| `T` _extends_ `readonly string[]` | The readonly array of allowed string values. |

#### Parameters

| Name     | Type                          | Description                                                 |
| -------- | ----------------------------- | ----------------------------------------------------------- |
| `values` | `T`                           | Allowed values.                                             |
| `opts`   | [`BaseOptions`](#baseoptions) | Common options (description, short, required). _(optional)_ |

#### Returns

[`CombinatorSchema`](#combinatorschema)\<`T`\[`number`\]\> — A combinator schema that resolves to a union of the allowed values.

#### Examples

```ts
const args = {
  level: choice(['debug', 'info', 'warn', 'error'] as const)
}
// typeof values.level === 'debug' | 'info' | 'warn' | 'error'
```

### Combinator

> [!WARNING]
> This API is experimental and may change in future versions.

A combinator produced by combinator factory functions.

#### Signature

```ts
type Combinator<T> = { parse: (value: string) => T }
```

#### Type Parameters

| Name | Description            |
| ---- | ---------------------- |
| `T`  | The parsed value type. |

#### Properties

| Name    | Type                   | Description                                                    |
| ------- | ---------------------- | -------------------------------------------------------------- |
| `parse` | `(value: string) => T` | The parse function that converts a string to the desired type. |

##### parse Parameters

| Name    | Type     | Description             |
| ------- | -------- | ----------------------- |
| `value` | `string` | The input string value. |

##### parse Returns

`T` — The parsed value of type T.

### combinator

> [!WARNING]
> This API is experimental and may change in future versions.

Create a custom argument schema with a user-defined parse function.

This is the most general custom combinator. Use it when none of the built-in
base combinators ([string](#string), [number](#number), [integer](#integer),
[float](#float), [boolean](#boolean), [choice](#choice)) fit your needs.

The returned schema has `type: 'custom'`.

#### Signature

```ts
declare function combinator<T>(config: CombinatorOptions<T>): CombinatorSchema<T>
```

#### Type Parameters

| Name | Description            |
| ---- | ---------------------- |
| `T`  | The parsed value type. |

#### Parameters

| Name     | Type                                             | Description                                               |
| -------- | ------------------------------------------------ | --------------------------------------------------------- |
| `config` | [`CombinatorOptions`](#combinatoroptions)\<`T`\> | Configuration with a parse function and optional metavar. |

#### Returns

[`CombinatorSchema`](#combinatorschema)\<`T`\> — A combinator schema that resolves to the parse function's return type.

#### Examples

```ts
const date = combinator({
  parse: value => {
    const d = new Date(value)
    if (isNaN(d.getTime())) {
      throw new Error('Invalid date format')
    }
    return d
  },
  metavar: 'date'
})
```

### CombinatorOptions

> [!WARNING]
> This API is experimental and may change in future versions.

Options for the [combinator](#combinator) factory function.

#### Extends

- [`BaseOptions`](#baseoptions)

#### Signature

```ts
interface CombinatorOptions<T> extends BaseOptions
```

#### Type Parameters

| Name | Description            |
| ---- | ---------------------- |
| `T`  | The parsed value type. |

#### Properties

| Name                   | Type                   | Description                                                    |
| ---------------------- | ---------------------- | -------------------------------------------------------------- |
| `metavar` _(optional)_ | `string`               | Display name hint for help text generation.                    |
| `parse`                | `(value: string) => T` | The parse function that converts a string to the desired type. |

##### parse Parameters

| Name    | Type     | Description             |
| ------- | -------- | ----------------------- |
| `value` | `string` | The input string value. |

##### parse Returns

`T` — The parsed value of type T.

### CombinatorSchema

> [!WARNING]
> This API is experimental and may change in future versions.

A schema produced by combinator factory functions.
Any [ArgSchema](/api-ox/default.md#argschema) with a parse function qualifies.

#### Signature

```ts
type CombinatorSchema<T> = ArgSchema & Combinator<T>
```

#### Type Parameters

| Name | Description            |
| ---- | ---------------------- |
| `T`  | The parsed value type. |

### describe

> [!WARNING]
> This API is experimental and may change in future versions.

Set a description on a combinator schema for help text generation.

The original schema is not modified.

#### Signature

```ts
declare function describe<T, D extends string>(
  schema: CombinatorSchema<T>,
  text: D
): CombinatorSchema<T> & CombinatorDescribe<D>
```

#### Type Parameters

| Name                   | Description                          |
| ---------------------- | ------------------------------------ |
| `T`                    | The schema's parsed type.            |
| `D` _extends_ `string` | The description string literal type. |

#### Parameters

| Name     | Type                                           | Description                 |
| -------- | ---------------------------------------------- | --------------------------- |
| `schema` | [`CombinatorSchema`](#combinatorschema)\<`T`\> | The base combinator schema. |
| `text`   | `D`                                            | Human-readable description. |

#### Returns

[`CombinatorSchema`](#combinatorschema)\<`T`\> & `CombinatorDescribe`\<`D`\> — A new schema with the description set.

#### Examples

```ts
const args = {
  port: describe(integer(), 'Port number to listen on')
}
```

### extend

> [!WARNING]
> This API is experimental and may change in future versions.

Extend a schema by overriding or adding fields.

Equivalent to `merge(base, overrides)` but communicates the intent of
intentional overrides rather than general composition.

#### Signature

```ts
declare function extend<T extends Args, U extends Args>(base: T, overrides: U): Omit<T, keyof U> & U
```

#### Type Parameters

| Name                                            | Description            |
| ----------------------------------------------- | ---------------------- |
| `T` _extends_ [`Args`](/api-ox/default.md#args) | Base schema type.      |
| `U` _extends_ [`Args`](/api-ox/default.md#args) | Overrides schema type. |

#### Parameters

| Name        | Type | Description                |
| ----------- | ---- | -------------------------- |
| `base`      | `T`  | The base schema to extend. |
| `overrides` | `U`  | Fields to override or add. |

#### Returns

`Omit<T, keyof U> & U` — A new schema with overrides applied.

#### Examples

```ts
const base = args({ port: withDefault(integer(), 8080) })
const strict = extend(base, { port: required(integer({ min: 1, max: 65535 })) })
```

### float

> [!WARNING]
> This API is experimental and may change in future versions.

Create a floating-point argument schema with optional range validation.

Rejects `NaN` and `Infinity` values.

#### Signature

```ts
declare function float(opts?: FloatOptions): CombinatorSchema<number>
```

#### Parameters

| Name   | Type                            | Description                 |
| ------ | ------------------------------- | --------------------------- |
| `opts` | [`FloatOptions`](#floatoptions) | Range options. _(optional)_ |

#### Returns

[`CombinatorSchema`](#combinatorschema)\<`number`\> — A combinator schema that resolves to number (float).

#### Examples

```ts
const args = {
  ratio: float({ min: 0, max: 1 })
}
```

### FloatOptions

> [!WARNING]
> This API is experimental and may change in future versions.

Options for the [float](#float) combinator.

#### Extends

- [`BaseOptions`](#baseoptions)

#### Signature

```ts
interface FloatOptions extends BaseOptions
```

#### Properties

| Name               | Type     | Description                |
| ------------------ | -------- | -------------------------- |
| `max` _(optional)_ | `number` | Maximum value (inclusive). |
| `min` _(optional)_ | `number` | Minimum value (inclusive). |

### integer

> [!WARNING]
> This API is experimental and may change in future versions.

Create an integer argument schema with optional range validation.

Only accepts integer values (no decimals).

#### Signature

```ts
declare function integer(opts?: IntegerOptions): CombinatorSchema<number>
```

#### Parameters

| Name   | Type                                | Description                 |
| ------ | ----------------------------------- | --------------------------- |
| `opts` | [`IntegerOptions`](#integeroptions) | Range options. _(optional)_ |

#### Returns

[`CombinatorSchema`](#combinatorschema)\<`number`\> — A combinator schema that resolves to number (integer).

#### Examples

```ts
const args = {
  retries: integer({ min: 0, max: 10 })
}
```

### IntegerOptions

> [!WARNING]
> This API is experimental and may change in future versions.

Options for the [integer](#integer) combinator.

#### Extends

- [`BaseOptions`](#baseoptions)

#### Signature

```ts
interface IntegerOptions extends BaseOptions
```

#### Properties

| Name               | Type     | Description                |
| ------------------ | -------- | -------------------------- |
| `max` _(optional)_ | `number` | Maximum value (inclusive). |
| `min` _(optional)_ | `number` | Minimum value (inclusive). |

### map

> [!WARNING]
> This API is experimental and may change in future versions.

Transform the output of a combinator schema.

Creates a new schema that applies `transform` to the result of `schema.parse`.
The original schema is not modified.

#### Signature

```ts
declare function map<T, U>(
  schema: CombinatorSchema<T>,
  transform: (value: T) => U
): CombinatorSchema<U>
```

#### Type Parameters

| Name | Description                     |
| ---- | ------------------------------- |
| `T`  | The input schema's parsed type. |
| `U`  | The transformed type.           |

#### Parameters

| Name        | Type                                           | Description                  |
| ----------- | ---------------------------------------------- | ---------------------------- |
| `schema`    | [`CombinatorSchema`](#combinatorschema)\<`T`\> | The base combinator schema.  |
| `transform` | `(value: T) => U`                              | The transformation function. |

#### Returns

[`CombinatorSchema`](#combinatorschema)\<`U`\> — A new combinator schema that resolves to the transformed type.

#### Examples

```ts
const args = {
  doubled: map(integer(), n => n * 2)
}
```

### merge

> [!WARNING]
> This API is experimental and may change in future versions.

Compose multiple [Args](/api-ox/default.md#args) schemas into one.

On key conflicts the later schema wins (last-write-wins).

#### Signature

```ts
declare function merge<A extends Args, B extends Args>(a: A, b: B): Omit<A, keyof B> & B
```

#### Type Parameters

| Name                                            | Description         |
| ----------------------------------------------- | ------------------- |
| `A` _extends_ [`Args`](/api-ox/default.md#args) | First schema type.  |
| `B` _extends_ [`Args`](/api-ox/default.md#args) | Second schema type. |

#### Parameters

| Name | Type | Description    |
| ---- | ---- | -------------- |
| `a`  | `A`  | First schema.  |
| `b`  | `B`  | Second schema. |

#### Returns

`Omit<A, keyof B> & B` — A merged schema containing all fields.

#### Examples

```ts
const common = args({ verbose: boolean() })
const network = args({ host: required(string()), port: withDefault(integer(), 8080) })
const schema = merge(common, network)
```

### merge

> [!WARNING]
> This API is experimental and may change in future versions.

Compose multiple [Args](/api-ox/default.md#args) schemas into one.

#### Signature

```ts
declare function merge<A extends Args, B extends Args, C extends Args>(
  a: A,
  b: B,
  c: C
): Omit<Omit<A, keyof B | keyof C> & Omit<B, keyof C>, never> & C
```

#### Type Parameters

| Name                                            |
| ----------------------------------------------- |
| `A` _extends_ [`Args`](/api-ox/default.md#args) |
| `B` _extends_ [`Args`](/api-ox/default.md#args) |
| `C` _extends_ [`Args`](/api-ox/default.md#args) |

#### Parameters

| Name | Type | Description    |
| ---- | ---- | -------------- |
| `a`  | `A`  | First schema.  |
| `b`  | `B`  | Second schema. |
| `c`  | `C`  | Third schema.  |

#### Returns

`Omit<Omit<A, keyof B | keyof C> & Omit<B, keyof C>, never> & C` — A merged schema containing all fields.

### merge

> [!WARNING]
> This API is experimental and may change in future versions.

Compose multiple [Args](/api-ox/default.md#args) schemas into one.

#### Signature

```ts
declare function merge<A extends Args, B extends Args, C extends Args, D extends Args>(
  a: A,
  b: B,
  c: C,
  d: D
): MergeArgs<[A, B, C, D]>
```

#### Type Parameters

| Name                                            |
| ----------------------------------------------- |
| `A` _extends_ [`Args`](/api-ox/default.md#args) |
| `B` _extends_ [`Args`](/api-ox/default.md#args) |
| `C` _extends_ [`Args`](/api-ox/default.md#args) |
| `D` _extends_ [`Args`](/api-ox/default.md#args) |

#### Parameters

| Name | Type | Description    |
| ---- | ---- | -------------- |
| `a`  | `A`  | First schema.  |
| `b`  | `B`  | Second schema. |
| `c`  | `C`  | Third schema.  |
| `d`  | `D`  | Fourth schema. |

#### Returns

`MergeArgs<[A, B, C, D]>` — A merged schema containing all fields.

### merge

> [!WARNING]
> This API is experimental and may change in future versions.

Compose multiple [Args](/api-ox/default.md#args) schemas into one.

#### Signature

```ts
declare function merge<T extends Args[]>(...schemas: T): MergeArgs<T>
```

#### Type Parameters

| Name                                                |
| --------------------------------------------------- |
| `T` _extends_ [`Args`](/api-ox/default.md#args)\[\] |

#### Parameters

| Name      | Type | Description           |
| --------- | ---- | --------------------- |
| `schemas` | `T`  | The schemas to merge. |

#### Returns

`MergeArgs<T>` — A merged schema containing all fields.

### multiple

> [!WARNING]
> This API is experimental and may change in future versions.

Mark a combinator schema as accepting multiple values.

The resolved value becomes an array. The original schema is not modified.

#### Signature

```ts
declare function multiple<T>(schema: CombinatorSchema<T>): CombinatorSchema<T> & CombinatorMultiple
```

#### Type Parameters

| Name | Description               |
| ---- | ------------------------- |
| `T`  | The schema's parsed type. |

#### Parameters

| Name     | Type                                           | Description                 |
| -------- | ---------------------------------------------- | --------------------------- |
| `schema` | [`CombinatorSchema`](#combinatorschema)\<`T`\> | The base combinator schema. |

#### Returns

[`CombinatorSchema`](#combinatorschema)\<`T`\> & `CombinatorMultiple` — A new schema with `multiple: true`.

#### Examples

```ts
const args = {
  tags: multiple(string())
}
// typeof values.tags === string[]
```

### number

> [!WARNING]
> This API is experimental and may change in future versions.

Create a number argument schema with optional range validation.

Accepts any numeric value (integer or float).

#### Signature

```ts
declare function number(opts?: NumberOptions): CombinatorSchema<number>
```

#### Parameters

| Name   | Type                              | Description                 |
| ------ | --------------------------------- | --------------------------- |
| `opts` | [`NumberOptions`](#numberoptions) | Range options. _(optional)_ |

#### Returns

[`CombinatorSchema`](#combinatorschema)\<`number`\> — A combinator schema that resolves to number.

#### Examples

```ts
const args = {
  timeout: number({ min: 0, max: 30000 })
}
```

### NumberOptions

> [!WARNING]
> This API is experimental and may change in future versions.

Options for the [number](#number) combinator.

#### Extends

- [`BaseOptions`](#baseoptions)

#### Signature

```ts
interface NumberOptions extends BaseOptions
```

#### Properties

| Name               | Type     | Description                |
| ------------------ | -------- | -------------------------- |
| `max` _(optional)_ | `number` | Maximum value (inclusive). |
| `min` _(optional)_ | `number` | Minimum value (inclusive). |

### positional

> [!WARNING]
> This API is experimental and may change in future versions.

Create a positional argument schema.

Without a parser, resolves to string.
With a parser (e.g., `positional(integer())`), resolves to the parser's return type.

#### Signature

```ts
declare function positional<T>(
  parser: CombinatorSchema<T>
): CombinatorSchema<T> & ArgSchemaPositionalType
```

#### Type Parameters

| Name | Description                 |
| ---- | --------------------------- |
| `T`  | The parser's resolved type. |

#### Parameters

| Name     | Type                                           | Description                   |
| -------- | ---------------------------------------------- | ----------------------------- |
| `parser` | [`CombinatorSchema`](#combinatorschema)\<`T`\> | The parser combinator schema. |

#### Returns

[`CombinatorSchema`](#combinatorschema)\<`T`\> & `ArgSchemaPositionalType` — A positional argument schema resolving to the parser's type.

#### Examples

```ts
const args = {
  command: positional(), // resolves to string
  port: positional(integer()) // resolves to number
}
```

### positional

> [!WARNING]
> This API is experimental and may change in future versions.

Create a positional argument schema.

Without a parser, resolves to string.
With a parser (e.g., `positional(integer())`), resolves to the parser's return type.

#### Signature

```ts
declare function positional(parser?: BaseOptions): ArgSchema & ArgSchemaPositionalType
```

#### Parameters

| Name     | Type                          | Description                                                        |
| -------- | ----------------------------- | ------------------------------------------------------------------ |
| `parser` | [`BaseOptions`](#baseoptions) | Optional base options (description, short, required). _(optional)_ |

#### Returns

[`ArgSchema`](/api-ox/default.md#argschema) & `ArgSchemaPositionalType` — A positional argument schema resolving to string.

#### Examples

```ts
const args = {
  command: positional(), // resolves to string
  port: positional(integer()) // resolves to number
}
```

### required

> [!WARNING]
> This API is experimental and may change in future versions.

Mark a combinator schema as required.

The original schema is not modified.

#### Signature

```ts
declare function required<T>(schema: CombinatorSchema<T>): CombinatorSchema<T> & CombinatorRequired
```

#### Type Parameters

| Name | Description               |
| ---- | ------------------------- |
| `T`  | The schema's parsed type. |

#### Parameters

| Name     | Type                                           | Description                 |
| -------- | ---------------------------------------------- | --------------------------- |
| `schema` | [`CombinatorSchema`](#combinatorschema)\<`T`\> | The base combinator schema. |

#### Returns

[`CombinatorSchema`](#combinatorschema)\<`T`\> & `CombinatorRequired` — A new schema with `required: true`.

#### Examples

```ts
const args = {
  name: required(string())
}
```

### short

> [!WARNING]
> This API is experimental and may change in future versions.

Set a short alias on a combinator schema.

The original schema is not modified.

#### Signature

```ts
declare function short<T, S extends string>(
  schema: CombinatorSchema<T>,
  alias: S
): CombinatorSchema<T> & CombinatorShort<S>
```

#### Type Parameters

| Name                   | Description                          |
| ---------------------- | ------------------------------------ |
| `T`                    | The schema's parsed type.            |
| `S` _extends_ `string` | The short alias string literal type. |

#### Parameters

| Name     | Type                                           | Description                   |
| -------- | ---------------------------------------------- | ----------------------------- |
| `schema` | [`CombinatorSchema`](#combinatorschema)\<`T`\> | The base combinator schema.   |
| `alias`  | `S`                                            | Single character short alias. |

#### Returns

[`CombinatorSchema`](#combinatorschema)\<`T`\> & `CombinatorShort`\<`S`\> — A new schema with the short alias set.

#### Examples

```ts
const args = {
  verbose: short(boolean(), 'v')
}
// Usage: -v or --verbose
```

### string

> [!WARNING]
> This API is experimental and may change in future versions.

Create a string argument schema with optional validation.

#### Signature

```ts
declare function string(opts?: StringOptions): CombinatorSchema<string>
```

#### Parameters

| Name   | Type                              | Description                      |
| ------ | --------------------------------- | -------------------------------- |
| `opts` | [`StringOptions`](#stringoptions) | Validation options. _(optional)_ |

#### Returns

[`CombinatorSchema`](#combinatorschema)\<`string`\> — A combinator schema that resolves to string.

#### Examples

```ts
const args = {
  name: string({ minLength: 1, maxLength: 50 })
}
```

### StringOptions

> [!WARNING]
> This API is experimental and may change in future versions.

Options for the [string](#string) combinator.

#### Extends

- [`BaseOptions`](#baseoptions)

#### Signature

```ts
interface StringOptions extends BaseOptions
```

#### Properties

| Name                     | Type     | Description                                      |
| ------------------------ | -------- | ------------------------------------------------ |
| `maxLength` _(optional)_ | `number` | Maximum string length.                           |
| `minLength` _(optional)_ | `number` | Minimum string length.                           |
| `pattern` _(optional)_   | `RegExp` | Regular expression pattern the value must match. |

### unrequired

> [!WARNING]
> This API is experimental and may change in future versions.

Mark a combinator schema as not required.

Useful for overriding a base combinator that was created with `required: true`.
The original schema is not modified.

#### Signature

```ts
declare function unrequired<T>(
  schema: CombinatorSchema<T>
): CombinatorSchema<T> & CombinatorUnrequired
```

#### Type Parameters

| Name | Description               |
| ---- | ------------------------- |
| `T`  | The schema's parsed type. |

#### Parameters

| Name     | Type                                           | Description                 |
| -------- | ---------------------------------------------- | --------------------------- |
| `schema` | [`CombinatorSchema`](#combinatorschema)\<`T`\> | The base combinator schema. |

#### Returns

[`CombinatorSchema`](#combinatorschema)\<`T`\> & `CombinatorUnrequired` — A new schema with `required: false`.

#### Examples

```ts
const args = {
  name: unrequired(string({ required: true }))
}
```

### withDefault

> [!WARNING]
> This API is experimental and may change in future versions.

Set a default value on a combinator schema.

The original schema is not modified.

#### Signature

```ts
declare function withDefault<T extends string | boolean | number>(
  schema: CombinatorSchema<T>,
  defaultValue: T
): CombinatorSchema<T> & CombinatorWithDefault<T>
```

#### Type Parameters

| Name                                        | Description               |
| ------------------------------------------- | ------------------------- |
| `T` _extends_ `string \| boolean \| number` | The schema's parsed type. |

#### Parameters

| Name           | Type                                           | Description                 |
| -------------- | ---------------------------------------------- | --------------------------- |
| `schema`       | [`CombinatorSchema`](#combinatorschema)\<`T`\> | The base combinator schema. |
| `defaultValue` | `T`                                            | The default value.          |

#### Returns

[`CombinatorSchema`](#combinatorschema)\<`T`\> & `CombinatorWithDefault`\<`T`\> — A new schema with the default value set.

#### Examples

```ts
const args = {
  port: withDefault(integer({ min: 1, max: 65535 }), 8080)
}
```
