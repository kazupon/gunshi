# CommandLoader

Command loader.

A function that returns a command or command runner.
This is used to lazily load commands.

## Signature

```ts
export type CommandLoader<G extends GunshiParamsConstraint = DefaultGunshiParams> = () => Awaitable<
  Command<G> | CommandRunner<G>
>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L744-L746)

## Type Parameters

| Name                                                           | Description                                                                                                                               |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `G` _extends_ `GunshiParamsConstraint` = `DefaultGunshiParams` | A type extending [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) to specify the shape of command context and command runner. |

## Returns

`unknown` — A command or command runner
