# PluginContext

Gunshi plugin context interface.

## Signature

```ts
export interface PluginContext<G extends GunshiParamsConstraint = DefaultGunshiParams>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/plugin/context.ts#L28-L131)

## Type Parameters

| Name                                                           | Description                                                                                                               |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `G` _extends_ `GunshiParamsConstraint` = `DefaultGunshiParams` | A type extending [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) to specify the shape of command parameters. |

## Properties

| Name                         | Kind     | Type                                                | Description                                                     |
| ---------------------------- | -------- | --------------------------------------------------- | --------------------------------------------------------------- |
| `globalOptions` _(readonly)_ | property | `Map<string, ArgSchema>`                            | Get the global options Returns: A map of global options.        |
| `subCommands` _(readonly)_   | property | `ReadonlyMap<string, Command<G> \| LazyCommand<G>>` | Get the registered sub commands Returns: A map of sub commands. |

## Methods

| Name                               | Kind   | Type                                                                                                                                                                                                                                                                                                                                                           | Description                                                                                                  |
| ---------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `addGlobalOption`                  | method | `addGlobalOption(name: string, schema: ArgSchema): void`                                                                                                                                                                                                                                                                                                       | Add a global option.                                                                                         |
| `addCommand`                       | method | `addCommand(name: string, command: Command<G> \| LazyCommand<G>): void`                                                                                                                                                                                                                                                                                        | Add a sub command.                                                                                           |
| `hasCommand`                       | method | `hasCommand(name: string): boolean`                                                                                                                                                                                                                                                                                                                            | Check if a command exists. Returns: True if the command exists, false otherwise                              |
| `decorateHeaderRenderer`           | method | `decorateHeaderRenderer<L extends Record<string, unknown> = DefaultGunshiParams['extensions']>(decorator: ( baseRenderer: (ctx: Readonly<CommandContext<MergeGunshiExtensions<G, L>>>) => Promise<string>, ctx: Readonly<CommandContext<MergeGunshiExtensions<G, L>>> ) => Promise<string>): void`                                                             | Decorate the header renderer.                                                                                |
| `decorateUsageRenderer`            | method | `decorateUsageRenderer<L extends Record<string, unknown> = DefaultGunshiParams['extensions']>(decorator: ( baseRenderer: (ctx: Readonly<CommandContext<MergeGunshiExtensions<G, L>>>) => Promise<string>, ctx: Readonly<CommandContext<MergeGunshiExtensions<G, L>>> ) => Promise<string>): void`                                                              | Decorate the usage renderer.                                                                                 |
| `decorateValidationErrorsRenderer` | method | `decorateValidationErrorsRenderer< L extends Record<string, unknown> = DefaultGunshiParams['extensions'] >(decorator: ( baseRenderer: ( ctx: Readonly<CommandContext<MergeGunshiExtensions<G, L>>>, error: AggregateError ) => Promise<string>, ctx: Readonly<CommandContext<MergeGunshiExtensions<G, L>>>, error: AggregateError ) => Promise<string>): void` | Decorate the validation errors renderer.                                                                     |
| `decorateCommand`                  | method | `decorateCommand<L extends Record<string, unknown> = DefaultGunshiParams['extensions']>(decorator: ( baseRunner: ( ctx: Readonly<CommandContext<MergeGunshiExtensions<G, L>>> ) => Awaitable<void \| string> ) => (ctx: Readonly<CommandContext<MergeGunshiExtensions<G, L>>>) => Awaitable<void \| string>): void`                                            | Decorate the command execution. Decorators are applied in reverse order (last registered is executed first). |

## Tags

- `@since` — v0.27.0
