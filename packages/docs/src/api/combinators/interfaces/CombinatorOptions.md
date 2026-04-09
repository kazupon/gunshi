[gunshi](../../index.md) / [combinators](../index.md) / CombinatorOptions

# Interface: CombinatorOptions\<T\>

**`Experimental`**

Options for the [combinator](../functions/combinator.md) factory function.

## Extends

- [`BaseOptions`](BaseOptions.md)

## Type Parameters

| Type Parameter | Description            |
| -------------- | ---------------------- |
| `T`            | The parsed value type. |

## Properties

| Property                                         | Type             | Description                                                                           | Inherited from                                                                       |
| ------------------------------------------------ | ---------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| <a id="property-description"></a> `description?` | `string`         | **`Experimental`** Human-readable description for help text generation.               | [`BaseOptions`](BaseOptions.md).[`description`](BaseOptions.md#property-description) |
| <a id="property-metavar"></a> `metavar?`         | `string`         | **`Experimental`** Display name hint for help text generation. **Default** `'custom'` | -                                                                                    |
| <a id="property-parse"></a> `parse`              | (`value`) => `T` | **`Experimental`** The parse function that converts a string to the desired type.     | -                                                                                    |
| <a id="property-required"></a> `required?`       | `boolean`        | **`Experimental`** Mark as required.                                                  | [`BaseOptions`](BaseOptions.md).[`required`](BaseOptions.md#property-required)       |
| <a id="property-short"></a> `short?`             | `string`         | **`Experimental`** Single character short alias.                                      | [`BaseOptions`](BaseOptions.md).[`short`](BaseOptions.md#property-short)             |
