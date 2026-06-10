# Interface: DryRunExtension

dry-run plugin extension.

## Signature

```ts
export interface DryRunExtension
```

## Properties

| Name | Type | Description |
| --- | --- | --- |
| `enabled` _(readonly)_ | `boolean` | Whether dry-run mode is enabled. |

## Methods

### run()

```ts
run<R>(task: () => Awaitable<R>, ...options: DryRunOptionsArg<R, DryRunRunResult<R>>): Awaitable<R>;
```

Run a side-effect task, or skip it in dry-run mode.

#### Type Parameters

| Name |
| --- |
| `R` |

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| `task` | `() => Awaitable<R>` | A side-effect task |
| `options` | [`DryRunOptionsArg`](/packages/plugin-dryrun/docs/default/type-aliases/DryRunOptionsArg.md)\<`R`, [`DryRunRunResult`](/packages/plugin-dryrun/docs/default/type-aliases/DryRunRunResult.md)\<`R`\>\> | Dry-run message and fallback result options. |

#### Returns

`Awaitable<R>` — The task result, or dry-run fallback result

***

### wrap()

```ts
wrap<A extends unknown[], R>(fn: (...args: A) => Awaitable<R>, ...options: DryRunOptionsArg<R, DryRunWrapResult<A, R>>): (...args: A) => Awaitable<R>;
```

Wrap a side-effect function, or skip it in dry-run mode.

#### Type Parameters

| Name |
| --- |
| `A` *extends* `unknown[]` |
| `R` |

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| `fn` | `(...args: A) => Awaitable<R>` | A side-effect function |
| `options` | [`DryRunOptionsArg`](/packages/plugin-dryrun/docs/default/type-aliases/DryRunOptionsArg.md)\<`R`, [`DryRunWrapResult`](/packages/plugin-dryrun/docs/default/type-aliases/DryRunWrapResult.md)\<`A`, `R`\>\> | Dry-run message and fallback result options. |

#### Returns

`(...args: A) => Awaitable<R>` — A wrapped function
