# Type Alias: DryRunOptionsArg&lt;R, O&gt;

dry-run options tuple for `run()` and `wrap()`.

Non-void operations require a fallback result option so dry-run mode can return a value without executing the side effect.

## Signature

```ts
export type DryRunOptionsArg<R, O> = [Awaited<R>] extends [void] ? [options?: DryRunMessage & Partial<O>] : [options: DryRunMessage & O]
```

## Type Parameters

| Name |
| --- |
| `R` |
| `O` |
