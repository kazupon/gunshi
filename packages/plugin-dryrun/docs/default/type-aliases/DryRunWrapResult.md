# Type Alias: DryRunWrapResult&lt;A, R&gt;

dry-run result option for `wrap()`.

## Signature

```ts
export type DryRunWrapResult<A extends unknown[], R> = { result: R } | { resolve: (...args: A) => Awaitable<R> }
```

## Type Parameters

| Name |
| --- |
| `A` *extends* `unknown[]` |
| `R` |
