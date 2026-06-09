# Function: default()

dry-run plugin

## Signature

```ts
export function dryrun(options: DryRunPluginOptions = {}): PluginWithExtension<DryRunExtension>
```

## Parameters

| Name | Type | Description |
| --- | --- | --- |
| `options` | [`DryRunPluginOptions`](/packages/plugin-dryrun/docs/default/interfaces/DryRunPluginOptions.md) | A [`dry-run plugin options`](/packages/plugin-dryrun/docs/default/interfaces/DryRunPluginOptions.md) _(optional, default: {})_ |

## Returns

`PluginWithExtension`\<[`DryRunExtension`](/packages/plugin-dryrun/docs/default/interfaces/DryRunExtension.md)\> — A defined plugin as dry-run
