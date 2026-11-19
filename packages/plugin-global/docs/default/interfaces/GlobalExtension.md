# Interface: GlobalExtension

Extended command context which provides utilities via global options plugin.
These utilities are available via `CommandContext.extensions['g:global']`.

The functions that show the version, the header and the usage print with `ctx.log`. So they print
nothing when `ctx.log` is silenced, with `usageSilent` or when a command that spreads `jsonArgs` is
asked for JSON with `--json`, and return the text only.

## Signature

```ts
export interface GlobalExtension
```

## Properties

| Name | Type | Description |
| --- | --- | --- |
| `showHeader` | `() => Awaitable<string \| undefined>` | Show the header of the application. |
| `showUsage` | `() => Awaitable<string \| undefined>` | Show the usage of the application, with the header as its title. if `--help` option is specified, it will print the usage to the console. |
| `showValidationErrors` | `(error: AggregateError) => Awaitable<string \| undefined>` | Show validation errors. This is called when argument validation fails. The rendered message is printed to stderr, unless it is empty or `usageSilent` is set. |
| `showVersion` | `() => string` | Show the version of the application. if `--version` option is specified, it will print the version to the console. |

### showHeader Returns

`Awaitable<string | undefined>` — The header of the application, or `undefined` if the `renderHeader` is not specified.

### showUsage Returns

`Awaitable<string | undefined>` — The header and the usage of the application, or `undefined` if the `renderUsage` is not specified.

### showValidationErrors Parameters

| Name | Type | Description |
| --- | --- | --- |
| `error` | `AggregateError` | The aggregate error containing validation failures |

### showValidationErrors Returns

`Awaitable<string | undefined>` — The rendered error message, or `undefined` if `renderValidationErrors` is null

### showVersion Returns

`string` — The version of the application, or `unknown` if the version is not specified.
