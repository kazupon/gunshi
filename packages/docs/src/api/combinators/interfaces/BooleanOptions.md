[gunshi](../../index.md) / [combinators](../index.md) / BooleanOptions

# Interface: BooleanOptions

**`Experimental`**

Options for the [boolean](../functions/boolean.md) combinator.

## Extends

- [`BaseOptions`](BaseOptions.md)

## Properties

| Property                                | Type      | Description                                                             | Inherited from                                                              |
| --------------------------------------- | --------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| <a id="description"></a> `description?` | `string`  | **`Experimental`** Human-readable description for help text generation. | [`BaseOptions`](BaseOptions.md).[`description`](BaseOptions.md#description) |
| <a id="negatable"></a> `negatable?`     | `boolean` | **`Experimental`** Enable negation with `--no-` prefix.                 | -                                                                           |
| <a id="required"></a> `required?`       | `boolean` | **`Experimental`** Mark as required.                                    | [`BaseOptions`](BaseOptions.md).[`required`](BaseOptions.md#required)       |
| <a id="short"></a> `short?`             | `string`  | **`Experimental`** Single character short alias.                        | [`BaseOptions`](BaseOptions.md).[`short`](BaseOptions.md#short)             |
