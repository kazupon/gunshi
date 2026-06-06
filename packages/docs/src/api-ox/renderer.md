# renderer

**[Source](https://github.com/kazupon/gunshi/blob/main/renderer)**

> 3 documented symbols. Read the signatures first, then expand each item for parameters, return types, and examples.

## Reference

### renderHeader

Render the header.

#### Signature

```ts
declare function renderHeader<G extends GunshiParams = DefaultGunshiParams>(
  ctx: Readonly<CommandContext<G>>
): Promise<string>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/plugin-renderer/lib/index.d.ts#L161)

#### Type Parameters

| Name                                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------- |
| `G` _extends_ [`GunshiParams`](/api-ox/default.md#gunshiparams) = [`DefaultGunshiParams`](/api-ox/default.md#defaultgunshiparams) |

#### Parameters

| Name  | Type                                                                       | Description                                            |
| ----- | -------------------------------------------------------------------------- | ------------------------------------------------------ |
| `ctx` | `Readonly`\<[`CommandContext`](/api-ox/default.md#commandcontext)\<`G`\>\> | A [command context](/api-ox/default.md#commandcontext) |

#### Returns

`Promise<string>` — A rendered header.

### renderUsage

Render the usage.

#### Signature

```ts
declare function renderUsage<G extends GunshiParams = DefaultGunshiParams>(
  ctx: Readonly<CommandContext<G>>
): Promise<string>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/plugin-renderer/lib/index.d.ts#L170)

#### Type Parameters

| Name                                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------- |
| `G` _extends_ [`GunshiParams`](/api-ox/default.md#gunshiparams) = [`DefaultGunshiParams`](/api-ox/default.md#defaultgunshiparams) |

#### Parameters

| Name  | Type                                                                       | Description                                            |
| ----- | -------------------------------------------------------------------------- | ------------------------------------------------------ |
| `ctx` | `Readonly`\<[`CommandContext`](/api-ox/default.md#commandcontext)\<`G`\>\> | A [command context](/api-ox/default.md#commandcontext) |

#### Returns

`Promise<string>` — A rendered usage.

### renderValidationErrors

Render the validation errors.

#### Signature

```ts
declare function renderValidationErrors<G extends GunshiParams = DefaultGunshiParams>(
  _ctx: CommandContext<G>,
  error: AggregateError
): Promise<string>
```

[View source](https://github.com/kazupon/gunshi/blob/main/packages/plugin-renderer/lib/index.d.ts#L180)

#### Type Parameters

| Name                                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------- |
| `G` _extends_ [`GunshiParams`](/api-ox/default.md#gunshiparams) = [`DefaultGunshiParams`](/api-ox/default.md#defaultgunshiparams) |

#### Parameters

| Name    | Type                                                         | Description                                            |
| ------- | ------------------------------------------------------------ | ------------------------------------------------------ |
| `_ctx`  | [`CommandContext`](/api-ox/default.md#commandcontext)\<`G`\> | A [command context](/api-ox/default.md#commandcontext) |
| `error` | `AggregateError`                                             | An AggregateError of option in `args-token` validation |

#### Returns

`Promise<string>` — A rendered validation error.
