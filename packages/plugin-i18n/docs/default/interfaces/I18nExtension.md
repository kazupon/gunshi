# Interface: I18nExtension&lt;G&gt;

Extended command context which provides utilities via i18n plugin.
These utilities are available via `CommandContext.extensions['g:i18n']`.

## Signature

```ts
export interface I18nExtension<G extends GunshiParams<any> = DefaultGunshiParams>
```

## Type Parameters

| Name | Description |
| --- | --- |
| `G` *extends* `GunshiParams<any>` = `DefaultGunshiParams` | Type parameter extending `GunshiParams` |

## Properties

| Name | Type | Description |
| --- | --- | --- |
| `loadResource` | `(locale: string \| Intl.Locale, ctx: CommandContext, command: Command) => Promise<boolean>` | Load command resources. |
| `locale` | `Intl.Locale` | Command locale |
| `registerGlobalOptionResources` | `(option: string, resources: Record<string, string>) => void` | Register global option resources. |
| `translate` | `(key: K, values?: Record<string, unknown>) => string` | Translate a message. |

### loadResource Parameters

| Name | Type | Description |
| --- | --- | --- |
| `locale` | `string \| Intl.Locale` | A locale to load resources for |
| `ctx` | `CommandContext` | A `command context` |
| `command` | `Command` | A `command` to load resources for |

### loadResource Returns

`Promise<boolean>` — Whether the resources were loaded successfully

### registerGlobalOptionResources Parameters

| Name | Type | Description |
| --- | --- | --- |
| `option` | `string` | An option name |
| `resources` | `Record<string, string>` | A map of resources for different locales |

### registerGlobalOptionResources Returns

`void`

### translate Type Parameters

| Name | Description |
| --- | --- |
| `A` *extends* `Args` = `G['args']` | The `Args` type extracted from G |
| `C` = `{}` | The command context type (usually `{}`) |
| `E` *extends* `Record<string, string>` = `{}` | The extended resource keys type (usually `{}`) |
| `K` = `ResolveTranslationKeys<A, C, E>` | - |

### translate Parameters

| Name | Type | Description |
| --- | --- | --- |
| `key` | `K` | Translation key |
| `values` | `Record<string, unknown>` | Values to interpolate _(optional)_ |

### translate Returns

`string` — Translated message. If the key is not found: - For custom keys: returns an empty string ('') - For built-in keys (prefixed with '_:'): returns the key itself
