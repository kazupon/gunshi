# Interface: CliOptions\<G\>

CLI options of [`cli`](/api-ox/default/functions/cli.md) function.

## Signature

```ts
export interface CliOptions<G extends GunshiParamsConstraint = DefaultGunshiParams>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L269-L361)

## Type Parameters

| Name                                                                                                                                                                            | Description                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `G` _extends_ [`GunshiParamsConstraint`](/api-ox/default/type-aliases/GunshiParamsConstraint.md) = [`DefaultGunshiParams`](/api-ox/default/type-aliases/DefaultGunshiParams.md) | A type extending [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) to specify the shape of cli options. |

## Properties

| Name                                  | Type                                                                                                                                                                                                                                                                | Description                                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `cwd` _(optional)_                    | [`string`](/api-ox/combinators/functions/string.md)                                                                                                                                                                                                                 | Current working directory.                                                                |
| `description` _(optional)_            | [`string`](/api-ox/combinators/functions/string.md)                                                                                                                                                                                                                 | Command program description.                                                              |
| `fallbackToEntry` _(optional)_        | [`boolean`](/api-ox/combinators/functions/boolean.md)                                                                                                                                                                                                               | Whether to fallback to entry command when the sub-command is not found. **Since** v0.27.0 |
| `leftMargin` _(optional)_             | [`number`](/api-ox/combinators/functions/number.md)                                                                                                                                                                                                                 | Left margin of the command output.                                                        |
| `middleMargin` _(optional)_           | [`number`](/api-ox/combinators/functions/number.md)                                                                                                                                                                                                                 | Middle margin of the command output.                                                      |
| `name` _(optional)_                   | [`string`](/api-ox/combinators/functions/string.md)                                                                                                                                                                                                                 | Command program name.                                                                     |
| `onAfterCommand` _(optional)_         | (`ctx`: `Readonly`\<[`CommandContext`](/api-ox/default/interfaces/CommandContext.md)\<`G`\>\>, `result`: [`string`](/api-ox/combinators/functions/string.md) \| `undefined`) =\> [`Awaitable`](/api-ox/default/type-aliases/Awaitable.md)\<`void`\>                 | Hook that runs after successful command execution **Since** v0.27.0                       |
| `onBeforeCommand` _(optional)_        | (`ctx`: `Readonly`\<[`CommandContext`](/api-ox/default/interfaces/CommandContext.md)\<`G`\>\>) =\> [`Awaitable`](/api-ox/default/type-aliases/Awaitable.md)\<`void`\>                                                                                               | Hook that runs before any command execution **Since** v0.27.0                             |
| `onErrorCommand` _(optional)_         | (`ctx`: `Readonly`\<[`CommandContext`](/api-ox/default/interfaces/CommandContext.md)\<`G`\>\>, `error`: `Error`) =\> [`Awaitable`](/api-ox/default/type-aliases/Awaitable.md)\<`void`\>                                                                             | Hook that runs when a command throws an error **Since** v0.27.0                           |
| `plugins` _(optional)_                | [`Plugin`](/api-ox/default/type-aliases/Plugin.md)\[\]                                                                                                                                                                                                              | User plugins. **Since** v0.27.0                                                           |
| `renderHeader` _(optional)_           | `unknown \| null`                                                                                                                                                                                                                                                   | Render function the header section in the command usage.                                  |
| `renderUsage` _(optional)_            | `unknown \| null`                                                                                                                                                                                                                                                   | Render function the command usage.                                                        |
| `renderValidationErrors` _(optional)_ | `unknown \| null`                                                                                                                                                                                                                                                   | Render function the validation errors.                                                    |
| `subCommands` _(optional)_            | `Record`\<[`string`](/api-ox/combinators/functions/string.md), [`SubCommandable`](/api-ox/default/interfaces/SubCommandable.md)\> \| `Map`\<[`string`](/api-ox/combinators/functions/string.md), [`SubCommandable`](/api-ox/default/interfaces/SubCommandable.md)\> | Sub commands.                                                                             |
| `usageOptionType` _(optional)_        | [`boolean`](/api-ox/combinators/functions/boolean.md)                                                                                                                                                                                                               | Whether to display the usage optional argument type.                                      |
| `usageOptionValue` _(optional)_       | [`boolean`](/api-ox/combinators/functions/boolean.md)                                                                                                                                                                                                               | Whether to display the optional argument value.                                           |
| `usageSilent` _(optional)_            | [`boolean`](/api-ox/combinators/functions/boolean.md)                                                                                                                                                                                                               | Whether to display the command usage.                                                     |
| `version` _(optional)_                | [`string`](/api-ox/combinators/functions/string.md)                                                                                                                                                                                                                 | Command program version.                                                                  |

### onAfterCommand Parameters

| Name     | Type      | Description                  |
| -------- | --------- | ---------------------------- |
| `ctx`    | `unknown` | The command context          |
| `result` | `unknown` | The command execution result |

### onBeforeCommand Parameters

| Name  | Type      | Description         |
| ----- | --------- | ------------------- |
| `ctx` | `unknown` | The command context |

### onErrorCommand Parameters

| Name    | Type      | Description                       |
| ------- | --------- | --------------------------------- |
| `ctx`   | `unknown` | The command context               |
| `error` | `unknown` | The error thrown during execution |
