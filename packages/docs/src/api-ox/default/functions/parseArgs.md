# Function: parseArgs()

Parse command line arguments.

## Signature

```ts
declare function parseArgs(args: string[], options?: ParserOptions): ArgToken[]
```

## Parameters

| Name      | Type                                                    | Description                                                 |
| --------- | ------------------------------------------------------- | ----------------------------------------------------------- |
| `args`    | [`string`](/api-ox/combinators/functions/string.md)\[\] | command line arguments                                      |
| `options` | `ParserOptions`                                         | parse options, about details see ParserOptions _(optional)_ |

## Returns

[`ArgToken`](/api-ox/default/interfaces/ArgToken.md)\[\] — Argument tokens.

## Examples

```js
import { parseArgs } from 'args-tokens' // for Node.js and Bun
// import { parseArgs } from 'jsr:@kazupon/args-tokens' // for Deno

const tokens = parseArgs(['--foo', 'bar', '-x', '--bar=baz'])
// do something with using tokens
// ...
console.log('tokens:', tokens)
```
