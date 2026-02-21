[gunshi](../../index.md) / [combinators](../index.md) / choice

# Function: choice()

```ts
function choice<T>(values, opts?): CombinatorSchema<T[number]>
```

**`Experimental`**

Create an enum-like argument schema with literal type inference.

Uses `const T` generic to infer literal union types from the values array.

## Type Parameters

| Type Parameter                    | Description                                  |
| --------------------------------- | -------------------------------------------- |
| `T` _extends_ readonly `string`[] | The readonly array of allowed string values. |

## Parameters

| Parameter | Type                                          | Description                                    |
| --------- | --------------------------------------------- | ---------------------------------------------- |
| `values`  | `T`                                           | Allowed values.                                |
| `opts?`   | [`BaseOptions`](../interfaces/BaseOptions.md) | Common options (description, short, required). |

## Returns

[`CombinatorSchema`](../type-aliases/CombinatorSchema.md)\<`T`\[`number`\]\>

A combinator schema that resolves to a union of the allowed values.

## Example

```ts
const args = {
  level: choice(['debug', 'info', 'warn', 'error'] as const)
}
// typeof values.level === 'debug' | 'info' | 'warn' | 'error'
```
