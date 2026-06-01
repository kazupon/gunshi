# SubCommandable

Sub-command entry type for use in subCommands.

This type uses a loose structural match to bypass TypeScript's contravariance issues
with function parameters, allowing any Command or LazyCommand to be used as a sub-command.

## Signature

```ts
export interface SubCommandable
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L656-L708)

## Properties

| Name                       | Kind     | Type                                      | Description                                                                           |
| -------------------------- | -------- | ----------------------------------------- | ------------------------------------------------------------------------------------- |
| `name` _(optional)_        | property | `string`                                  | see [Command.name](/api-ox/default/interfaces/Command.md#property-name)               |
| `description` _(optional)_ | property | `string`                                  | see [Command.description](/api-ox/default/interfaces/Command.md#property-description) |
| `args` _(optional)_        | property | `Args \| Record<string, any>`             | see [Command.args](/api-ox/default/interfaces/Command.md#property-args)               |
| `examples` _(optional)_    | property | `string \| unknown`                       | see [Command.examples](/api-ox/default/interfaces/Command.md#property-examples)       |
| `run` _(optional)_         | property | `() => any`                               | see [Command.run](/api-ox/default/interfaces/Command.md#property-run)                 |
| `toKebab` _(optional)_     | property | `boolean`                                 | see [Command.toKebab](/api-ox/default/interfaces/Command.md#property-tokebab)         |
| `internal` _(optional)_    | property | `boolean`                                 | see [Command.internal](/api-ox/default/interfaces/Command.md#property-internal)       |
| `entry` _(optional)_       | property | `boolean`                                 | see [Command.entry](/api-ox/default/interfaces/Command.md#property-entry)             |
| `rendering` _(optional)_   | property | `any`                                     | see [Command.rendering](/api-ox/default/interfaces/Command.md#property-rendering)     |
| `commandName` _(optional)_ | property | `string`                                  | see LazyCommand.commandName                                                           |
| `subCommands` _(optional)_ | property | `Record<string, any> \| Map<string, any>` | Nested sub-commands for this command.                                                 |

## Tags

- `@since` — v0.27.1
