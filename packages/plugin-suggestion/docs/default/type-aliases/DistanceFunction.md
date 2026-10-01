# Type Alias: DistanceFunction

Distance function for scoring candidate names.

Lower values are treated as better matches.

## Signature

```ts
export type DistanceFunction = (input: string, candidate: string) => number
```

## Parameters

| Name | Type | Description |
| --- | --- | --- |
| `input` | `string` |  |
| `candidate` | `string` |  |

## Returns

`number`
