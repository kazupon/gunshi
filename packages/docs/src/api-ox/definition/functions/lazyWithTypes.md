# Function: lazyWithTypes()

Define a [lazy command](/api-ox/default/type-aliases/LazyCommand.md) with specific type parameters.

This helper function allows specifying the type parameter of [GunshiParams](/api-ox/default/interfaces/GunshiParams.md)
while inferring the [Args](/api-ox/default/interfaces/Args.md) type, [ExtendContext](/api-ox/default/type-aliases/ExtendContext.md) type from the definition.

## Since

v0.27.0

## Signature

```ts
export function lazyWithTypes<G extends GunshiParamsConstraint>(): LazyWithTypesReturn<
  NormalizeToGunshiParams<G>
>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/definition.ts#L349-L361)

## Type Parameters

| Name                                                                                             | Description                                                       |
| ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `G` _extends_ [`GunshiParamsConstraint`](/api-ox/default/type-aliases/GunshiParamsConstraint.md) | A [GunshiParams](/api-ox/default/interfaces/GunshiParams.md) type |

## Returns

`LazyWithTypesReturn< NormalizeToGunshiParams<G> >` — A function that takes a lazy command definition via [lazy](/api-ox/definition/functions/lazy.md)

## Examples

```ts
type MyExtensions = { logger: { log: (message: string) => void } }

const command = lazyWithTypes<{ extensions: MyExtensions }>()(
  () => {
    return ctx => {
      // Command runner implementation
      ctx.extensions.logger?.log('Command executed')
  },
 {
  name: 'lazy-command',
  args: {
    opt: {
      type: 'string',
      description: 'An optional string argument',
      required: false,
    },
  },
)
```
