# CliOptions

CLI options of [`cli`](/api-ox/default/functions/cli.md) function.

## Signature

```ts
export interface CliOptions<G extends GunshiParamsConstraint = DefaultGunshiParams>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L269-L361)

## Type Parameters

| Name                                                           | Description                                                                                                        |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `G` _extends_ `GunshiParamsConstraint` = `DefaultGunshiParams` | A type extending [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) to specify the shape of cli options. |

## Properties

| Name                                  | Kind     | Type                                                                                 | Description                                                             |
| ------------------------------------- | -------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `cwd` _(optional)_                    | property | `string`                                                                             | Current working directory.                                              |
| `name` _(optional)_                   | property | `string`                                                                             | Command program name.                                                   |
| `description` _(optional)_            | property | `string`                                                                             | Command program description.                                            |
| `version` _(optional)_                | property | `string`                                                                             | Command program version.                                                |
| `subCommands` _(optional)_            | property | `Record<string, SubCommandable> \| Map<string, SubCommandable>`                      | Sub commands.                                                           |
| `leftMargin` _(optional)_             | property | `number`                                                                             | Left margin of the command output.                                      |
| `middleMargin` _(optional)_           | property | `number`                                                                             | Middle margin of the command output.                                    |
| `usageOptionType` _(optional)_        | property | `boolean`                                                                            | Whether to display the usage optional argument type.                    |
| `usageOptionValue` _(optional)_       | property | `boolean`                                                                            | Whether to display the optional argument value.                         |
| `usageSilent` _(optional)_            | property | `boolean`                                                                            | Whether to display the command usage.                                   |
| `renderUsage` _(optional)_            | property | `unknown \| null`                                                                    | Render function the command usage.                                      |
| `renderHeader` _(optional)_           | property | `unknown \| null`                                                                    | Render function the header section in the command usage.                |
| `renderValidationErrors` _(optional)_ | property | `unknown \| null`                                                                    | Render function the validation errors.                                  |
| `fallbackToEntry` _(optional)_        | property | `boolean`                                                                            | Whether to fallback to entry command when the sub-command is not found. |
| `plugins` _(optional)_                | property | `Plugin[]`                                                                           | User plugins.                                                           |
| `onBeforeCommand` _(optional)_        | property | `(ctx: Readonly<CommandContext<G>>) => Awaitable<void>`                              | Hook that runs before any command execution                             |
| `onAfterCommand` _(optional)_         | property | `(ctx: Readonly<CommandContext<G>>, result: string \| undefined) => Awaitable<void>` | Hook that runs after successful command execution                       |
| `onErrorCommand` _(optional)_         | property | `(ctx: Readonly<CommandContext<G>>, error: Error) => Awaitable<void>`                | Hook that runs when a command throws an error                           |
