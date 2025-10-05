[**@gunshi/plugin-i18n**](../index.md)

***

[@gunshi/plugin-i18n](../index.md) / DefaultTranslation

# Class: DefaultTranslation

Default implementation of [TranslationAdapter](../interfaces/TranslationAdapter.md).

## Implements

- [`TranslationAdapter`](../interfaces/TranslationAdapter.md)

## Constructors

### Constructor

```ts
new DefaultTranslation(options): DefaultTranslation;
```

Creates a new instance of DefaultTranslation.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`TranslationAdapterFactoryOptions`](../interfaces/TranslationAdapterFactoryOptions.md) | Options for the translation adapter, see [TranslationAdapterFactoryOptions](../interfaces/TranslationAdapterFactoryOptions.md) |

#### Returns

`DefaultTranslation`

## Methods

### getMessage()

```ts
getMessage(locale, key): undefined | string;
```

Get a message of locale.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `locale` | `string` | A locale of message (BCP 47 language tag) |
| `key` | `string` | A key of message resource |

#### Returns

`undefined` \| `string`

A message of locale. If message not found, return `undefined`.

#### Implementation of

[`TranslationAdapter`](../interfaces/TranslationAdapter.md).[`getMessage`](../interfaces/TranslationAdapter.md#getmessage)

***

### getResource()

```ts
getResource(locale): undefined | Record<string, string>;
```

Get a resource of locale.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `locale` | `string` | A locale of resource (BCP 47 language tag) |

#### Returns

`undefined` \| `Record`\<`string`, `string`\>

A resource of locale. If resource not found, return `undefined`.

#### Implementation of

[`TranslationAdapter`](../interfaces/TranslationAdapter.md).[`getResource`](../interfaces/TranslationAdapter.md#getresource)

***

### setResource()

```ts
setResource(locale, resource): void;
```

Set a resource of locale.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `locale` | `string` | A locale of resource (BCP 47 language tag) |
| `resource` | `Record`\<`string`, `string`\> | A resource of locale |

#### Returns

`void`

#### Implementation of

[`TranslationAdapter`](../interfaces/TranslationAdapter.md).[`setResource`](../interfaces/TranslationAdapter.md#setresource)

***

### translate()

```ts
translate(
   locale, 
   key, 
   values): undefined | string;
```

Translate a message.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `locale` | `string` | A locale of message (BCP 47 language tag) |
| `key` | `string` | A key of message resource |
| `values` | `Record`\<`string`, `unknown`\> | A values to interpolate in the message |

#### Returns

`undefined` \| `string`

A translated message, if message is not translated, return `undefined`.

#### Implementation of

[`TranslationAdapter`](../interfaces/TranslationAdapter.md).[`translate`](../interfaces/TranslationAdapter.md#translate)
