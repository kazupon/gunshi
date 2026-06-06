[**@gunshi/plugin-dryrun**](../index.md)

***

[@gunshi/plugin-dryrun](../index.md) / DryRunWrapResult

# Type Alias: DryRunWrapResult\<A, R\>

```ts
type DryRunWrapResult<A, R> = 
  | {
  result: R;
}
  | {
  resolve: (...args) => Awaitable<R>;
};
```

dry-run result option for `wrap()`.

## Type Parameters

| Type Parameter |
| ------ |
| `A` *extends* `unknown`[] |
| `R` |
