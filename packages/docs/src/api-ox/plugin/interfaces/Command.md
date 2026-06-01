# Command

Command interface.

## Signature

```ts
export interface Command<G extends GunshiParamsConstraint = DefaultGunshiParams>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L553-L613)

## Type Parameters

| Name                                                           | Description                      |
| -------------------------------------------------------------- | -------------------------------- |
| `G` _extends_ `GunshiParamsConstraint` = `DefaultGunshiParams` | The Gunshi parameters constraint |

## Properties

| Name                       | Kind     | Type                                                            | Description                                                                                                                                                                 |
| -------------------------- | -------- | --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name` _(optional)_        | property | `string`                                                        | Command name. It's used to find command line arguments to execute from sub commands, and it's recommended to specify.                                                       |
| `description` _(optional)_ | property | `string`                                                        | Command description. It's used to describe the command in usage and it's recommended to specify.                                                                            |
| `args` _(optional)_        | property | `ExtractArgs<G>`                                                | Command arguments. Each argument can include a description property to describe the argument in usage.                                                                      |
| `examples` _(optional)_    | property | `string \| CommandExamplesFetcher<G>`                           | Command examples. examples of how to use the command.                                                                                                                       |
| `run` _(optional)_         | property | `CommandRunner<G>`                                              | Command runner. it's the command to be executed                                                                                                                             |
| `toKebab` _(optional)_     | property | `boolean`                                                       | Whether to convert the camel-case style argument name to kebab-case. If you will set to `true`, All [`Command.args`](#property-args) names will be converted to kebab-case. |
| `internal` _(optional)_    | property | `boolean`                                                       | Whether this is an internal command. Internal commands are not shown in help usage.                                                                                         |
| `entry` _(optional)_       | property | `boolean`                                                       | Whether this command is an entry command.                                                                                                                                   |
| `rendering` _(optional)_   | property | `RenderingOptions<G>`                                           | Rendering control options                                                                                                                                                   |
| `subCommands` _(optional)_ | property | `Record<string, SubCommandable> \| Map<string, SubCommandable>` | Nested sub-commands for this command. Allows building command trees like `git remote add`. Each key is the sub-command name, and the value is a command or lazy command.    |
