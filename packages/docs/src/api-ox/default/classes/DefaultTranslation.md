# DefaultTranslation

Default implementation of `TranslationAdapter`.

## Signature

```ts
declare class DefaultTranslation implements TranslationAdapter
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/plugin-i18n/lib/index.d.ts#L954-L993)

## Constructors

| Name          | Kind        | Type                                                     | Description                                   |
| ------------- | ----------- | -------------------------------------------------------- | --------------------------------------------- |
| `constructor` | constructor | `constructor(options: TranslationAdapterFactoryOptions)` | Creates a new instance of DefaultTranslation. |

## Methods

| Name          | Kind   | Type                                                                                            | Description                                                                                           |
| ------------- | ------ | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `getResource` | method | `getResource(locale: string): Record<string, string> \| undefined`                              | Get a resource of locale. Returns: A resource of locale. If resource not found, return `undefined`.   |
| `setResource` | method | `setResource(locale: string, resource: Record<string, string>): void`                           | Set a resource of locale.                                                                             |
| `getMessage`  | method | `getMessage(locale: string, key: string): string \| undefined`                                  | Get a message of locale. Returns: A message of locale. If message not found, return `undefined`.      |
| `translate`   | method | `translate(locale: string, key: string, values?: Record<string, unknown>): string \| undefined` | Translate a message. Returns: A translated message, if message is not translated, return `undefined`. |
