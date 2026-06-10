# Class: DefaultTranslation

Default implementation of [`TranslationAdapter`](/packages/plugin-i18n/docs/default/interfaces/TranslationAdapter.md).

## Implements

- [`TranslationAdapter`](/packages/plugin-i18n/docs/default/interfaces/TranslationAdapter.md)

## Signature

```ts
export class DefaultTranslation implements TranslationAdapter
```

## Constructors

### Constructor

```ts
new DefaultTranslation(options: TranslationAdapterFactoryOptions): DefaultTranslation;
```

Creates a new instance of DefaultTranslation.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| `options` | [`TranslationAdapterFactoryOptions`](/packages/plugin-i18n/docs/default/interfaces/TranslationAdapterFactoryOptions.md) | Options for the translation adapter, see [`TranslationAdapterFactoryOptions`](/packages/plugin-i18n/docs/default/interfaces/TranslationAdapterFactoryOptions.md) |

#### Returns

[`DefaultTranslation`](/packages/plugin-i18n/docs/default/classes/DefaultTranslation.md)

## Methods

### getMessage()

```ts
getMessage(locale: string, key: string): string | undefined;
```

Get a message of locale.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| `locale` | `string` | A locale of message (BCP 47 language tag) |
| `key` | `string` | A key of message resource |

#### Returns

`string | undefined` — A message of locale. If message not found, return `undefined`.

#### Implementation of

```ts
TranslationAdapter.getMessage
```

***

### getResource()

```ts
getResource(locale: string): Record<string, string> | undefined;
```

Get a resource of locale.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| `locale` | `string` | A locale of resource (BCP 47 language tag) |

#### Returns

`Record<string, string> | undefined` — A resource of locale. If resource not found, return `undefined`.

#### Implementation of

```ts
TranslationAdapter.getResource
```

***

### setResource()

```ts
setResource(locale: string, resource: Record<string, string>): void;
```

Set a resource of locale.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| `locale` | `string` | A locale of resource (BCP 47 language tag) |
| `resource` | `Record<string, string>` | A resource of locale |

#### Returns

`void`

#### Implementation of

```ts
TranslationAdapter.setResource
```

***

### translate()

```ts
translate(locale: string, key: string, values: Record<string, unknown> = Object.create(null) as Record<string, unknown>): string | undefined;
```

Translate a message.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| `locale` | `string` | A locale of message (BCP 47 language tag) |
| `key` | `string` | A key of message resource |
| `values` | `Record<string, unknown>` | A values to interpolate in the message _(optional, default: Object.create(null) as Record<string, unknown>)_ |

#### Returns

`string | undefined` — A translated message, if message is not translated, return `undefined`.

#### Implementation of

```ts
TranslationAdapter.translate
```
