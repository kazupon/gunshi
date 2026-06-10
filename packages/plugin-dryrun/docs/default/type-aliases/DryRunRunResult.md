# Type Alias: DryRunRunResult&lt;R&gt;

dry-run result option for `run()`.

## Signature

```ts
export type DryRunRunResult<R> = { result: R } | { resolve: () => Awaitable<R> }
```

## Type Parameters

| Name |
| --- |
| `R` |
