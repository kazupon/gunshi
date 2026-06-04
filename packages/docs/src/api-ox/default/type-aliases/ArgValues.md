# Type Alias: ArgValues\<T\>

An object that contains the values of the arguments.

## Signature

```ts
type ArgValues<T> = T extends Args
  ? ResolveArgValues<T, { [Arg in keyof T]: ExtractOptionValue<T[Arg]> }>
  : {
      [option: string]: string | boolean | number | (string | boolean | number)[] | undefined
    }
```

## Type Parameters

| Name | Description                                                                                                 |
| ---- | ----------------------------------------------------------------------------------------------------------- |
| `T`  | [Arguments](/api-ox/default/interfaces/Args.md) which is an object that defines the command line arguments. |
