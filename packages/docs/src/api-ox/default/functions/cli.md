# Function: cli()

Run the command.

## Call Signature

```ts
export async function cli<G extends GunshiParamsConstraint>(
  args: string[],
  entry: Command<G> | CommandRunner<G> | LazyCommand<G>,
  options?: CliOptions<G>
): Promise<string | undefined>
```

Run the command.

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/cli/builtin.ts#L34-L38)

### Type Parameters

| Name                                                                                             | Description                                                                                                                    |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `G` _extends_ [`GunshiParamsConstraint`](/api-ox/default/type-aliases/GunshiParamsConstraint.md) | A type extending [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) to specify the shape of command and cli options. |

### Parameters

| Name      | Type                                                                                                                                                                                                        | Description                                                                                                                                                                                                    |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `args`    | [`string`](/api-ox/combinators/functions/string.md)\[\]                                                                                                                                                     | Command line arguments                                                                                                                                                                                         |
| `entry`   | [`Command`](/api-ox/default/interfaces/Command.md)\<`G`\> \| [`CommandRunner`](/api-ox/default/type-aliases/CommandRunner.md)\<`G`\> \| [`LazyCommand`](/api-ox/default/type-aliases/LazyCommand.md)\<`G`\> | A [entry command](/api-ox/default/interfaces/Command.md), an [inline command runner](/api-ox/default/type-aliases/CommandRunner.md), or a [lazily-loaded command](/api-ox/default/type-aliases/LazyCommand.md) |
| `options` | [`CliOptions`](/api-ox/default/interfaces/CliOptions.md)\<`G`\>                                                                                                                                             | A [CLI options](/api-ox/default/interfaces/CliOptions.md) _(optional)_                                                                                                                                         |

### Returns

`Promise`\<[`string`](/api-ox/combinators/functions/string.md) \| `undefined`\> — A rendered usage or undefined. if you will use [`CliOptions.usageSilent`](/api-ox/default/interfaces/CliOptions.md#property-usagesilent) option, it will return rendered usage string.

## Call Signature

```ts
export async function cli<
  A extends Args = Args,
  G extends GunshiParams = { args: A; extensions: {} }
>(
  args: string[],
  entry: Command<G> | CommandRunner<G> | LazyCommand<G>,
  options?: CliOptions<G>
): Promise<string | undefined>
```

Run the command.

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/cli/builtin.ts#L50-L57)

### Type Parameters

| Name                                                                                                                                                    | Description                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `A` _extends_ [`Args`](/api-ox/default/interfaces/Args.md) = [`Args`](/api-ox/default/interfaces/Args.md)                                               | The type of [`arguments`](/api-ox/default/interfaces/Args.md) defined in the command and cli options. |
| `G` _extends_ [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) = { [`args`](/api-ox/combinators/functions/args.md): `A`; `extensions`: {} } |                                                                                                       |

### Parameters

| Name      | Type                                                                                                                                                                                                        | Description                                                                                                                                                                                                    |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `args`    | [`string`](/api-ox/combinators/functions/string.md)\[\]                                                                                                                                                     | Command line arguments                                                                                                                                                                                         |
| `entry`   | [`Command`](/api-ox/default/interfaces/Command.md)\<`G`\> \| [`CommandRunner`](/api-ox/default/type-aliases/CommandRunner.md)\<`G`\> \| [`LazyCommand`](/api-ox/default/type-aliases/LazyCommand.md)\<`G`\> | A [entry command](/api-ox/default/interfaces/Command.md), an [inline command runner](/api-ox/default/type-aliases/CommandRunner.md), or a [lazily-loaded command](/api-ox/default/type-aliases/LazyCommand.md) |
| `options` | [`CliOptions`](/api-ox/default/interfaces/CliOptions.md)\<`G`\>                                                                                                                                             | A [CLI options](/api-ox/default/interfaces/CliOptions.md) _(optional)_                                                                                                                                         |

### Returns

`Promise`\<[`string`](/api-ox/combinators/functions/string.md) \| `undefined`\> — A rendered usage or undefined. if you will use [`CliOptions.usageSilent`](/api-ox/default/interfaces/CliOptions.md#property-usagesilent) option, it will return rendered usage string.

## Call Signature

```ts
export async function cli<
  E extends ExtendContext = ExtendContext,
  G extends GunshiParams = { args: Args; extensions: E }
>(
  args: string[],
  entry: Command<G> | CommandRunner<G> | LazyCommand<G>,
  options?: CliOptions<G>
): Promise<string | undefined>
```

Run the command.

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/cli/builtin.ts#L69-L76)

### Type Parameters

| Name                                                                                                                                                                                              | Description                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `E` _extends_ [`ExtendContext`](/api-ox/default/type-aliases/ExtendContext.md) = [`ExtendContext`](/api-ox/default/type-aliases/ExtendContext.md)                                                 | An [`ExtendContext`](/api-ox/default/type-aliases/ExtendContext.md) type to specify the shape of command and cli options. |
| `G` _extends_ [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) = { [`args`](/api-ox/combinators/functions/args.md): [`Args`](/api-ox/default/interfaces/Args.md); `extensions`: `E` } |                                                                                                                           |

### Parameters

| Name      | Type                                                                                                                                                                                                        | Description                                                                                                                                                                                                    |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `args`    | [`string`](/api-ox/combinators/functions/string.md)\[\]                                                                                                                                                     | Command line arguments                                                                                                                                                                                         |
| `entry`   | [`Command`](/api-ox/default/interfaces/Command.md)\<`G`\> \| [`CommandRunner`](/api-ox/default/type-aliases/CommandRunner.md)\<`G`\> \| [`LazyCommand`](/api-ox/default/type-aliases/LazyCommand.md)\<`G`\> | A [entry command](/api-ox/default/interfaces/Command.md), an [inline command runner](/api-ox/default/type-aliases/CommandRunner.md), or a [lazily-loaded command](/api-ox/default/type-aliases/LazyCommand.md) |
| `options` | [`CliOptions`](/api-ox/default/interfaces/CliOptions.md)\<`G`\>                                                                                                                                             | A [CLI options](/api-ox/default/interfaces/CliOptions.md) _(optional)_                                                                                                                                         |

### Returns

`Promise`\<[`string`](/api-ox/combinators/functions/string.md) \| `undefined`\> — A rendered usage or undefined. if you will use [`CliOptions.usageSilent`](/api-ox/default/interfaces/CliOptions.md#property-usagesilent) option, it will return rendered usage string.

## Call Signature

```ts
export async function cli<G extends GunshiParams = DefaultGunshiParams>(
  args: string[],
  entry: Command<G> | CommandRunner<G> | LazyCommand<G>,
  options?: CliOptions<G>
): Promise<string | undefined>
```

Run the command.

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/cli/builtin.ts#L88-L92)

### Type Parameters

| Name                                                                                                                                                      | Description                                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `G` _extends_ [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) = [`DefaultGunshiParams`](/api-ox/default/type-aliases/DefaultGunshiParams.md) | A type extending [`GunshiParams`](/api-ox/default/interfaces/GunshiParams.md) to specify the shape of command and cli options. |

### Parameters

| Name      | Type                                                                                                                                                                                                        | Description                                                                                                                                                                                                    |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `args`    | [`string`](/api-ox/combinators/functions/string.md)\[\]                                                                                                                                                     | Command line arguments                                                                                                                                                                                         |
| `entry`   | [`Command`](/api-ox/default/interfaces/Command.md)\<`G`\> \| [`CommandRunner`](/api-ox/default/type-aliases/CommandRunner.md)\<`G`\> \| [`LazyCommand`](/api-ox/default/type-aliases/LazyCommand.md)\<`G`\> | A [entry command](/api-ox/default/interfaces/Command.md), an [inline command runner](/api-ox/default/type-aliases/CommandRunner.md), or a [lazily-loaded command](/api-ox/default/type-aliases/LazyCommand.md) |
| `options` | [`CliOptions`](/api-ox/default/interfaces/CliOptions.md)\<`G`\>                                                                                                                                             | A [CLI options](/api-ox/default/interfaces/CliOptions.md) _(optional)_                                                                                                                                         |

### Returns

`Promise`\<[`string`](/api-ox/combinators/functions/string.md) \| `undefined`\> — A rendered usage or undefined. if you will use [`CliOptions.usageSilent`](/api-ox/default/interfaces/CliOptions.md#property-usagesilent) option, it will return rendered usage string.

## Call Signature

```ts
export async function cli(
  args: string[],
  entry: SubCommandable,
  options?: CliOptions
): Promise<string | undefined>
```

Run the command.

This overload accepts any command-like object using a loose structural type.
It bypasses TypeScript contravariance issues with callback properties.

Note: This overload MUST be last in the overload list. TypeScript checks overloads
in declaration order and selects the first matching one. The SubCommandable type
is intentionally loose and would match any command, so placing it first would
prevent proper type inference for more specific command types.

[View source](https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/cli/builtin.ts#L110-L114)

### Parameters

| Name      | Type                                                             | Description                                                            |
| --------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `args`    | [`string`](/api-ox/combinators/functions/string.md)\[\]          | Command line arguments                                                 |
| `entry`   | [`SubCommandable`](/api-ox/default/interfaces/SubCommandable.md) | A command-like object (command, command runner, or lazy command)       |
| `options` | [`CliOptions`](/api-ox/default/interfaces/CliOptions.md)         | A [CLI options](/api-ox/default/interfaces/CliOptions.md) _(optional)_ |

### Returns

`Promise`\<[`string`](/api-ox/combinators/functions/string.md) \| `undefined`\> — A rendered usage or undefined. if you will use [`CliOptions.usageSilent`](/api-ox/default/interfaces/CliOptions.md#property-usagesilent) option, it will return rendered usage string.
