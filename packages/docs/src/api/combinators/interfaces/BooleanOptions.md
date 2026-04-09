[gunshi](../../index.md) / [combinators](../index.md) / BooleanOptions

# Interface: BooleanOptions

**`Experimental`**

Options for the [boolean](../functions/boolean.md) combinator.

## Extends

- [`BaseOptions`](BaseOptions.md)

## Properties

| Property                                         | Type      | Description                                                             | Inherited from                                                                       |
| ------------------------------------------------ | --------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| <a id="property-description"></a> `description?` | `string`  | **`Experimental`** Human-readable description for help text generation. | [`BaseOptions`](BaseOptions.md).[`description`](BaseOptions.md#property-description) |
| <a id="property-negatable"></a> `negatable?`     | `boolean` | **`Experimental`** Enable negation with `--no-` prefix.                 | -                                                                                    |
| <a id="property-required"></a> `required?`       | `boolean` | **`Experimental`** Mark as required.                                    | [`BaseOptions`](BaseOptions.md).[`required`](BaseOptions.md#property-required)       |
| <a id="property-short"></a> `short?`             | `string`  | **`Experimental`** Single character short alias.                        | [`BaseOptions`](BaseOptions.md).[`short`](BaseOptions.md#property-short)             |
