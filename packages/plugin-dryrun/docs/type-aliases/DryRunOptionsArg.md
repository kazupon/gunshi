[**@gunshi/plugin-dryrun**](../index.md)

***

[@gunshi/plugin-dryrun](../index.md) / DryRunOptionsArg

# Type Alias: DryRunOptionsArg\<R, O\>

```ts
type DryRunOptionsArg<R, O> = [Awaited<R>] extends [void] ? [DryRunMessage & Partial<O>] : [DryRunMessage & O];
```

dry-run options tuple for `run()` and `wrap()`.

Non-void operations require a fallback result option so dry-run mode can return a value without executing the side effect.

## Type Parameters

| Type Parameter |
| ------ |
| `R` |
| `O` |
