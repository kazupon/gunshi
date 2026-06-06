[**@gunshi/plugin-dryrun**](../index.md)

***

[@gunshi/plugin-dryrun](../index.md) / DryRunRunResult

# Type Alias: DryRunRunResult\<R\>

```ts
type DryRunRunResult<R> = 
  | {
  result: R;
}
  | {
  resolve: () => Awaitable<R>;
};
```

dry-run result option for `run()`.

## Type Parameters

| Type Parameter |
| ------ |
| `R` |
