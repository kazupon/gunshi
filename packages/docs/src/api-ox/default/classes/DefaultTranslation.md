# Class: DefaultTranslation

Default implementation of `TranslationAdapter`.

## Signature

```ts
declare class DefaultTranslation implements TranslationAdapter
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/plugin-i18n/lib/index.d.ts#L954-L993)

## Constructors

| Name          | Type                                                     | Description                                   |
| ------------- | -------------------------------------------------------- | --------------------------------------------- |
| `constructor` | `constructor(options: TranslationAdapterFactoryOptions)` | Creates a new instance of DefaultTranslation. |

### constructor Parameters

| Name      | Type                               | Description                                                                 |
| --------- | ---------------------------------- | --------------------------------------------------------------------------- |
| `options` | `TranslationAdapterFactoryOptions` | Options for the translation adapter, see `TranslationAdapterFactoryOptions` |

## Methods

| Name          | Type                                                                                                                                                                                                                                                                                              | Description                                                                                           |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `getMessage`  | `getMessage`(`locale`: [`string`](/api-ox/combinators/functions/string.md), `key`: [`string`](/api-ox/combinators/functions/string.md)): [`string`](/api-ox/combinators/functions/string.md) \| `undefined`                                                                                       | Get a message of locale. Returns: A message of locale. If message not found, return `undefined`.      |
| `getResource` | `getResource`(`locale`: [`string`](/api-ox/combinators/functions/string.md)): `Record`\<[`string`](/api-ox/combinators/functions/string.md), [`string`](/api-ox/combinators/functions/string.md)\> \| `undefined`                                                                                 | Get a resource of locale. Returns: A resource of locale. If resource not found, return `undefined`.   |
| `setResource` | `setResource`(`locale`: [`string`](/api-ox/combinators/functions/string.md), `resource`: `Record`\<[`string`](/api-ox/combinators/functions/string.md), [`string`](/api-ox/combinators/functions/string.md)\>): `void`                                                                            | Set a resource of locale.                                                                             |
| `translate`   | `translate`(`locale`: [`string`](/api-ox/combinators/functions/string.md), `key`: [`string`](/api-ox/combinators/functions/string.md), `values`?: `Record`\<[`string`](/api-ox/combinators/functions/string.md), `unknown`\>): [`string`](/api-ox/combinators/functions/string.md) \| `undefined` | Translate a message. Returns: A translated message, if message is not translated, return `undefined`. |

### getMessage Parameters

| Name     | Type                                                | Description                               |
| -------- | --------------------------------------------------- | ----------------------------------------- |
| `locale` | [`string`](/api-ox/combinators/functions/string.md) | A locale of message (BCP 47 language tag) |
| `key`    | [`string`](/api-ox/combinators/functions/string.md) | A key of message resource                 |

### getResource Parameters

| Name     | Type                                                | Description                                |
| -------- | --------------------------------------------------- | ------------------------------------------ |
| `locale` | [`string`](/api-ox/combinators/functions/string.md) | A locale of resource (BCP 47 language tag) |

### setResource Parameters

| Name       | Type                                                                                                                 | Description                                |
| ---------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `locale`   | [`string`](/api-ox/combinators/functions/string.md)                                                                  | A locale of resource (BCP 47 language tag) |
| `resource` | `Record`\<[`string`](/api-ox/combinators/functions/string.md), [`string`](/api-ox/combinators/functions/string.md)\> | A resource of locale                       |

### translate Parameters

| Name     | Type                                                                       | Description                                         |
| -------- | -------------------------------------------------------------------------- | --------------------------------------------------- |
| `locale` | [`string`](/api-ox/combinators/functions/string.md)                        | A locale of message (BCP 47 language tag)           |
| `key`    | [`string`](/api-ox/combinators/functions/string.md)                        | A key of message resource                           |
| `values` | `Record`\<[`string`](/api-ox/combinators/functions/string.md), `unknown`\> | A values to interpolate in the message _(optional)_ |
