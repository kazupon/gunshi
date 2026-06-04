# Interface: SubCommandable

Sub-command entry type for use in subCommands.

This type uses a loose structural match to bypass TypeScript's contravariance issues
with function parameters, allowing any Command or LazyCommand to be used as a sub-command.

## Since

v0.27.1

## Signature

```ts
export interface SubCommandable
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L656-L708)

## Properties

| Name                       | Type                                                                                                                                          | Description                                                                           |
| -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `args` _(optional)_        | [`Args`](/api-ox/default/interfaces/Args.md) \| `Record`\<[`string`](/api-ox/combinators/functions/string.md), `any`\>                        | see [Command.args](/api-ox/default/interfaces/Command.md#property-args)               |
| `commandName` _(optional)_ | [`string`](/api-ox/combinators/functions/string.md)                                                                                           | see LazyCommand.commandName                                                           |
| `description` _(optional)_ | [`string`](/api-ox/combinators/functions/string.md)                                                                                           | see [Command.description](/api-ox/default/interfaces/Command.md#property-description) |
| `entry` _(optional)_       | [`boolean`](/api-ox/combinators/functions/boolean.md)                                                                                         | see [Command.entry](/api-ox/default/interfaces/Command.md#property-entry)             |
| `examples` _(optional)_    | [`string`](/api-ox/combinators/functions/string.md) \| `unknown`                                                                              | see [Command.examples](/api-ox/default/interfaces/Command.md#property-examples)       |
| `internal` _(optional)_    | [`boolean`](/api-ox/combinators/functions/boolean.md)                                                                                         | see [Command.internal](/api-ox/default/interfaces/Command.md#property-internal)       |
| `name` _(optional)_        | [`string`](/api-ox/combinators/functions/string.md)                                                                                           | see [Command.name](/api-ox/default/interfaces/Command.md#property-name)               |
| `rendering` _(optional)_   | `any`                                                                                                                                         | see [Command.rendering](/api-ox/default/interfaces/Command.md#property-rendering)     |
| `run` _(optional)_         | `() => any`                                                                                                                                   | see [Command.run](/api-ox/default/interfaces/Command.md#property-run)                 |
| `subCommands` _(optional)_ | `Record`\<[`string`](/api-ox/combinators/functions/string.md), `any`\> \| `Map`\<[`string`](/api-ox/combinators/functions/string.md), `any`\> | Nested sub-commands for this command. **Since** v0.28.0                               |
| `toKebab` _(optional)_     | [`boolean`](/api-ox/combinators/functions/boolean.md)                                                                                         | see [Command.toKebab](/api-ox/default/interfaces/Command.md#property-tokebab)         |
