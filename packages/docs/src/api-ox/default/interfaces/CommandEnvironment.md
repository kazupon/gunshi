# Interface: CommandEnvironment\<G\>

Command environment.

## Signature

```ts
export interface CommandEnvironment<G extends GunshiParamsConstraint = DefaultGunshiParams>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L158-L262)

## Type Parameters

| Name                                                                                                                                                                            | Description                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `G` _extends_ [`GunshiParamsConstraint`](/api-ox/default/type-aliases/GunshiParamsConstraint.md) = [`DefaultGunshiParams`](/api-ox/default/type-aliases/DefaultGunshiParams.md) | A type extending [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) to specify the shape of command environments. |

## Properties

| Name                     | Type                                                                                                                                                                                                              | Description                                                         |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `cwd`                    | [`string`](/api-ox/combinators/functions/string.md) \| `undefined`                                                                                                                                                | Current working directory.                                          |
| `description`            | [`string`](/api-ox/combinators/functions/string.md) \| `undefined`                                                                                                                                                | Command description.                                                |
| `leftMargin`             | [`number`](/api-ox/combinators/functions/number.md)                                                                                                                                                               | Left margin of the command output.                                  |
| `middleMargin`           | [`number`](/api-ox/combinators/functions/number.md)                                                                                                                                                               | Middle margin of the command output.                                |
| `name`                   | [`string`](/api-ox/combinators/functions/string.md) \| `undefined`                                                                                                                                                | Command name.                                                       |
| `onAfterCommand`         | `unknown \| undefined`                                                                                                                                                                                            | Hook that runs after successful command execution **Since** v0.27.0 |
| `onBeforeCommand`        | `unknown \| undefined`                                                                                                                                                                                            | Hook that runs before any command execution **Since** v0.27.0       |
| `onErrorCommand`         | `unknown \| undefined`                                                                                                                                                                                            | Hook that runs when a command throws an error **Since** v0.27.0     |
| `renderHeader`           | `unknown \| null \| undefined`                                                                                                                                                                                    | Render function the header section in the command usage.            |
| `renderUsage`            | `unknown \| null \| undefined`                                                                                                                                                                                    | Render function the command usage.                                  |
| `renderValidationErrors` | `unknown \| null \| undefined`                                                                                                                                                                                    | Render function the validation errors.                              |
| `subCommands`            | `Map`\<[`string`](/api-ox/combinators/functions/string.md), [`Command`](/api-ox/default/interfaces/Command.md)\<`any`\> \| [`LazyCommand`](/api-ox/default/type-aliases/LazyCommand.md)\<`any`\>\> \| `undefined` | Sub commands.                                                       |
| `usageOptionType`        | [`boolean`](/api-ox/combinators/functions/boolean.md)                                                                                                                                                             | Whether to display the usage option type.                           |
| `usageOptionValue`       | [`boolean`](/api-ox/combinators/functions/boolean.md)                                                                                                                                                             | Whether to display the option value.                                |
| `usageSilent`            | [`boolean`](/api-ox/combinators/functions/boolean.md)                                                                                                                                                             | Whether to display the command usage.                               |
| `version`                | [`string`](/api-ox/combinators/functions/string.md) \| `undefined`                                                                                                                                                | Command version.                                                    |
