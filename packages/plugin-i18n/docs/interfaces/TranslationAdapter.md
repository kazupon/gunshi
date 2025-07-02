[**@gunshi/plugin-i18n**](../index.md)

***

[@gunshi/plugin-i18n](../index.md) / TranslationAdapter

# Interface: TranslationAdapter\<MessageResource\>

Translation adapter.
This adapter is used to custom message formatter like [Intlify message format](https://github.com/intlify/vue-i18n/blob/master/spec/syntax.ebnf), [\`Intl.MessageFormat\` (MF2)](https://github.com/tc39/proposal-intl-messageformat), and etc.
This adapter will support localization with your preferred message format.

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `MessageResource` | `string` |

## Methods

### getMessage()

```ts
getMessage(locale, key): undefined | MessageResource;
```

Get a message of locale.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `locale` | `string` | A Locale at the time of command execution. That is Unicord locale ID (BCP 47) |
| `key` | `string` | A key of message resource |

#### Returns

`undefined` \| `MessageResource`

A message of locale. if message not found, return `undefined`.

***

### getResource()

```ts
getResource(locale): undefined | Record<string, string>;
```

Get a resource of locale.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `locale` | `string` | A Locale at the time of command execution. That is Unicord locale ID (BCP 47) |

#### Returns

`undefined` \| `Record`\<`string`, `string`\>

A resource of locale. if resource not found, return `undefined`.

***

### setResource()

```ts
setResource(locale, resource): void;
```

Set a resource of locale.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `locale` | `string` | A Locale at the time of command execution. That is Unicord locale ID (BCP 47) |
| `resource` | `Record`\<`string`, `string`\> | A resource of locale |

#### Returns

`void`

***

### translate()

```ts
translate(
   locale, 
   key, 
   values?): undefined | string;
```

Translate a message.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `locale` | `string` | A Locale at the time of command execution. That is Unicord locale ID (BCP 47) |
| `key` | `string` | A key of message resource |
| `values?` | `Record`\<`string`, `unknown`\> | A values to be resolved in the message |

#### Returns

`undefined` \| `string`

A translated message, if message is not translated, return `undefined`.
