# Interface: DryRunPluginOptions

dry-run plugin options.

## Signature

```ts
export interface DryRunPluginOptions
```

## Properties

| Name | Type | Description |
| --- | --- | --- |
| `description` _(optional)_ | `string` | fallback dry-run option description. |
| `descriptionResources` _(optional)_ | `Record<string, string>` | localized dry-run option descriptions, used with `@gunshi/plugin-i18n`. |
| `name` _(optional)_ | `string` | command values key for dry-run option. **Default:** `'dryRun'` |
| `prefix` _(optional)_ | `string` | dry-run output prefix. **Default:** `'[dryrun]'` |
