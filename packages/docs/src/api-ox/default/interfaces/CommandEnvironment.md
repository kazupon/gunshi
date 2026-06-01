# CommandEnvironment

Command environment.

## Signature

```ts
export interface CommandEnvironment<G extends GunshiParamsConstraint = DefaultGunshiParams>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L158-L262)

## Type Parameters

| Name                                                           | Description                                                                                                                 |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `G` _extends_ `GunshiParamsConstraint` = `DefaultGunshiParams` | A type extending [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) to specify the shape of command environments. |

## Properties

| Name                     | Kind     | Type                                                         | Description                                              |
| ------------------------ | -------- | ------------------------------------------------------------ | -------------------------------------------------------- |
| `cwd`                    | property | `string \| undefined`                                        | Current working directory.                               |
| `name`                   | property | `string \| undefined`                                        | Command name.                                            |
| `description`            | property | `string \| undefined`                                        | Command description.                                     |
| `version`                | property | `string \| undefined`                                        | Command version.                                         |
| `leftMargin`             | property | `number`                                                     | Left margin of the command output.                       |
| `middleMargin`           | property | `number`                                                     | Middle margin of the command output.                     |
| `usageOptionType`        | property | `boolean`                                                    | Whether to display the usage option type.                |
| `usageOptionValue`       | property | `boolean`                                                    | Whether to display the option value.                     |
| `usageSilent`            | property | `boolean`                                                    | Whether to display the command usage.                    |
| `subCommands`            | property | `Map<string, Command<any> \| LazyCommand<any>> \| undefined` | Sub commands.                                            |
| `renderUsage`            | property | `unknown \| null \| undefined`                               | Render function the command usage.                       |
| `renderHeader`           | property | `unknown \| null \| undefined`                               | Render function the header section in the command usage. |
| `renderValidationErrors` | property | `unknown \| null \| undefined`                               | Render function the validation errors.                   |
| `onBeforeCommand`        | property | `unknown \| undefined`                                       | Hook that runs before any command execution              |
| `onAfterCommand`         | property | `unknown \| undefined`                                       | Hook that runs after successful command execution        |
| `onErrorCommand`         | property | `unknown \| undefined`                                       | Hook that runs when a command throws an error            |
