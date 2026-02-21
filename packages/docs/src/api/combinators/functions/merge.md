[gunshi](../../index.md) / [combinators](../index.md) / merge

# Function: merge()

## Call Signature

```ts
function merge<A, B>(a, b): Omit<A, keyof B> & B
```

**`Experimental`**

Compose multiple [Args](../../default/interfaces/Args.md) schemas into one.

On key conflicts the later schema wins (last-write-wins).

### Type Parameters

| Type Parameter                                           | Description         |
| -------------------------------------------------------- | ------------------- |
| `A` _extends_ [`Args`](../../default/interfaces/Args.md) | First schema type.  |
| `B` _extends_ [`Args`](../../default/interfaces/Args.md) | Second schema type. |

### Parameters

| Parameter | Type | Description    |
| --------- | ---- | -------------- |
| `a`       | `A`  | First schema.  |
| `b`       | `B`  | Second schema. |

### Returns

`Omit`\<`A`, keyof `B`\> & `B`

A merged schema containing all fields.

### Example

```ts
const common = args({ verbose: boolean() })
const network = args({ host: required(string()), port: withDefault(integer(), 8080) })
const schema = merge(common, network)
```

## Call Signature

```ts
function merge<A, B, C>(a, b, c): Omit<Omit<A, keyof B | keyof C> & Omit<B, keyof C>, never> & C
```

**`Experimental`**

Compose multiple [Args](../../default/interfaces/Args.md) schemas into one.

### Type Parameters

| Type Parameter                                           |
| -------------------------------------------------------- |
| `A` _extends_ [`Args`](../../default/interfaces/Args.md) |
| `B` _extends_ [`Args`](../../default/interfaces/Args.md) |
| `C` _extends_ [`Args`](../../default/interfaces/Args.md) |

### Parameters

| Parameter | Type | Description    |
| --------- | ---- | -------------- |
| `a`       | `A`  | First schema.  |
| `b`       | `B`  | Second schema. |
| `c`       | `C`  | Third schema.  |

### Returns

`Omit`\<`Omit`\<`A`, keyof `B` \| keyof `C`\> & `Omit`\<`B`, keyof `C`\>, `never`\> & `C`

A merged schema containing all fields.

## Call Signature

```ts
function merge<A, B, C, D>(
  a,
  b,
  c,
  d
): Omit<
  A,
  keyof D | Exclude<keyof C, keyof D> | Exclude<keyof B, keyof D | Exclude<keyof C, keyof D>>
> &
  Omit<B, keyof D | Exclude<keyof C, keyof D>> &
  Omit<C, keyof D> &
  D
```

**`Experimental`**

Compose multiple [Args](../../default/interfaces/Args.md) schemas into one.

### Type Parameters

| Type Parameter                                           |
| -------------------------------------------------------- |
| `A` _extends_ [`Args`](../../default/interfaces/Args.md) |
| `B` _extends_ [`Args`](../../default/interfaces/Args.md) |
| `C` _extends_ [`Args`](../../default/interfaces/Args.md) |
| `D` _extends_ [`Args`](../../default/interfaces/Args.md) |

### Parameters

| Parameter | Type | Description    |
| --------- | ---- | -------------- |
| `a`       | `A`  | First schema.  |
| `b`       | `B`  | Second schema. |
| `c`       | `C`  | Third schema.  |
| `d`       | `D`  | Fourth schema. |

### Returns

`Omit`\<`A`,
\| keyof `D`
\| `Exclude`\<keyof `C`, keyof `D`\>
\| `Exclude`\<keyof `B`, keyof `D` \| `Exclude`\<keyof `C`, keyof `D`\>\>\> & `Omit`\<`B`, keyof `D` \| `Exclude`\<keyof `C`, keyof `D`\>\> & `Omit`\<`C`, keyof `D`\> & `D`

A merged schema containing all fields.

## Call Signature

```ts
function merge<T>(...schemas): MergeArgs<T>
```

**`Experimental`**

Compose multiple [Args](../../default/interfaces/Args.md) schemas into one.

### Type Parameters

| Type Parameter                                             |
| ---------------------------------------------------------- |
| `T` _extends_ [`Args`](../../default/interfaces/Args.md)[] |

### Parameters

| Parameter    | Type | Description           |
| ------------ | ---- | --------------------- |
| ...`schemas` | `T`  | The schemas to merge. |

### Returns

`MergeArgs`\<`T`\>

A merged schema containing all fields.
