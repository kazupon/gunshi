# defineWithTypes

Define a [command](/api-ox/definition/interfaces/Command.md) with types

This helper function allows specifying the type parameter of [GunshiParams](/api-ox/definition/interfaces/GunshiParams.md)
while inferring the [Args](/api-ox/definition/interfaces/Args.md) type, [ExtendContext](/api-ox/definition/type-aliases/ExtendContext.md) type from the definition.

## Signature

```ts
export function defineWithTypes<G extends GunshiParamsConstraint>(): DefineWithTypesReturn<
  ExtractExtensions<G>,
  ExtractArgs<G>
>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/definition.ts#L182-L201)

## Type Parameters

| Name                                   | Description                                                          |
| -------------------------------------- | -------------------------------------------------------------------- |
| `G` _extends_ `GunshiParamsConstraint` | A [GunshiParams](/api-ox/definition/interfaces/GunshiParams.md) type |

## Returns

`DefineWithTypesReturn< ExtractExtensions<G>, ExtractArgs<G> >` — A function that takes a command definition via [define](/api-ox/definition/functions/define.md)

## Examples

```ts
// Define a command with specific extensions type
type MyExtensions = { logger: { log: (message: string) => void } }

const command = defineWithTypes<{ extensions: MyExtensions }>()({
  name: 'greet',
  args: {
    name: { type: 'string' }
  },
  run: ctx => {
    // ctx.values is inferred as { name?: string }
    // ctx.extensions is MyExtensions
  }
})
```

## Tags

- `@since` — v0.27.0
