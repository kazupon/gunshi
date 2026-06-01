# LazyCommand

Lazy command interface.

Lazy command that's not loaded until it is executed.

## Signature

```ts
export type LazyCommand<
  G extends GunshiParamsConstraint = DefaultGunshiParams,
  D extends Partial<Command<G>> = {}
> = {
  /**
   * Command load function
   */
  (): Awaitable<Command<G> | CommandRunner<G>>
} &
  // If definition has name, commandName is required with that type
  (D extends { name: infer N } ? { commandName: N } : { commandName?: string }) &
  // Properties from the definition (if provided inline)
  Omit<D, 'name' | 'run'> &
  // Remaining properties from Command (optional)
  Partial<Omit<Command<G>, keyof D | 'run' | 'name'>>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L623-L637)

## Type Parameters

| Name                                                           | Description                                              |
| -------------------------------------------------------------- | -------------------------------------------------------- |
| `G` _extends_ `GunshiParamsConstraint` = `DefaultGunshiParams` | The Gunshi parameters constraint                         |
| `D` _extends_ `Partial<Command<G>>` = `{}`                     | The partial command definition provided to lazy function |
