# Interface: TranslationAdapter&lt;MessageResource&gt;

Translation adapter.

This adapter is used to custom message formatter like [Intlify message format](https://github.com/intlify/vue-i18n/blob/master/spec/syntax.ebnf), [`Intl.MessageFormat` (MF2)](https://github.com/tc39/proposal-intl-messageformat), and etc.
This adapter will support localization with your preferred message format.

## Signature

```ts
export interface TranslationAdapter<MessageResource = string>
```

## Type Parameters

| Name |
| --- |
| `MessageResource` = `string` |

## Methods

### getMessage()

```ts
getMessage(locale: string, key: string): MessageResource | undefined;
```

Get a message of locale.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| `locale` | `string` | A Locale at the time of command execution. That is Unicord locale ID (BCP 47) |
| `key` | `string` | A key of message resource |

#### Returns

`MessageResource | undefined` — A message of locale. if message not found, return `undefined`.

***

### getResource()

```ts
getResource(locale: string): Record<string, string> | undefined;
```

Get a resource of locale.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| `locale` | `string` | A Locale at the time of command execution. That is Unicord locale ID (BCP 47) |

#### Returns

`Record<string, string> | undefined` — A resource of locale. if resource not found, return `undefined`.

***

### setResource()

```ts
setResource(locale: string, resource: Record<string, string>): void;
```

Set a resource of locale.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| `locale` | `string` | A Locale at the time of command execution. That is Unicord locale ID (BCP 47) |
| `resource` | `Record<string, string>` | A resource of locale |

#### Returns

`void`

***

### translate()

```ts
translate(locale: string, key: string, values?: Record<string, unknown>): string | undefined;
```

Translate a message.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| `locale` | `string` | A Locale at the time of command execution. That is Unicord locale ID (BCP 47) |
| `key` | `string` | A key of message resource |
| `values` | `Record<string, unknown>` | A values to be resolved in the message _(optional)_ |

#### Returns

`string | undefined` — A translated message, if message is not translated, return `undefined`.
