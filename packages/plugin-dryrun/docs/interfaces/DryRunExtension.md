[**@gunshi/plugin-dryrun**](../index.md)

***

[@gunshi/plugin-dryrun](../index.md) / DryRunExtension

# Interface: DryRunExtension

dry-run plugin extension.

## Methods

### run()

```ts
run<R>(task, ...options): Awaitable<R>;
```

Run a side-effect task, or skip it in dry-run mode.

#### Type Parameters

| Type Parameter |
| ------ |
| `R` |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `task` | () => `Awaitable`\<`R`\> | A side-effect task |
| ...`options` | [`DryRunOptionsArg`](../type-aliases/DryRunOptionsArg.md)\<`R`, [`DryRunRunResult`](../type-aliases/DryRunRunResult.md)\<`R`\>\> | Dry-run message and fallback result options. |

#### Returns

`Awaitable`\<`R`\>

The task result, or dry-run fallback result

***

### wrap()

```ts
wrap<A, R>(fn, ...options): (...args) => Awaitable<R>;
```

Wrap a side-effect function, or skip it in dry-run mode.

#### Type Parameters

| Type Parameter |
| ------ |
| `A` *extends* `unknown`[] |
| `R` |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn` | (...`args`) => `Awaitable`\<`R`\> | A side-effect function |
| ...`options` | [`DryRunOptionsArg`](../type-aliases/DryRunOptionsArg.md)\<`R`, [`DryRunWrapResult`](../type-aliases/DryRunWrapResult.md)\<`A`, `R`\>\> | Dry-run message and fallback result options. |

#### Returns

A wrapped function

(...`args`) => `Awaitable`\<`R`\>

## Properties

| Property | Modifier | Type | Description |
| ------ | ------ | ------ | ------ |
| <a id="property-enabled"></a> `enabled` | `readonly` | `boolean` | Whether dry-run mode is enabled. |
