# Interface: UsageRendererExtension&lt;G&gt;

Extended command context which provides utilities via usage renderer plugin.
These utilities are available via `CommandContext.extensions['g:renderer']`.

## Signature

```ts
export interface UsageRendererExtension<G extends GunshiParams<any> = DefaultGunshiParams>
```

## Type Parameters

| Name | Description |
| --- | --- |
| `G` *extends* `GunshiParams<any>` = `DefaultGunshiParams` | A type extending GunshiParams to specify the shape of command parameters. |

## Properties

| Name | Type | Description |
| --- | --- | --- |
| `loadCommands` | `() => Promise<Command<G>[]>` | Load commands |
| `text` | `(key: K, values?: Record<string, unknown>) => Promise<string>` | Render the text message. |

### loadCommands Type Parameters

| Name | Description |
| --- | --- |
| `G` *extends* `GunshiParams` = `DefaultGunshiParams` | A type extending GunshiParams to specify the shape of command parameters. |

### loadCommands Returns

`Promise<Command<G>[]>` — A list of commands loaded from the usage renderer plugin.

### text Type Parameters

| Name | Description |
| --- | --- |
| `A` *extends* `Args` = `G['args']` | The type of `arguments` defined in the command parameters. |
| `C` = `{}` | The type representing the command context. |
| `E` *extends* `Record<string, string>` = `{}` | The type representing extended resources for localization. |
| `K` = `ResolveTranslationKeys<A, C, E>` | - |

### text Parameters

| Name | Type | Description |
| --- | --- | --- |
| `key` | `K` | The translation key to be resolved. |
| `values` | `Record<string, unknown>` | An optional record of values to interpolate into the translation string. _(optional)_ |

### text Returns

`Promise<string>` — The resolved translation string with interpolated values if provided.
