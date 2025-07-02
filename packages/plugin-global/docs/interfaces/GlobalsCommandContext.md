[**@gunshi/plugin-global**](../index.md)

---

[@gunshi/plugin-global](../index.md) / GlobalsCommandContext

# Interface: GlobalsCommandContext

Extended command context which provides utilities via global options plugin.
These utilities are available via `CommandContext.extensions['g:globals']`.

## Properties

| Property                                                 | Type                                                | Description                                                                                                        |
| -------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| <a id="showheader"></a> `showHeader`                     | () => `Awaitable`\<`undefined` \| `string`\>        | Show the header of the application.                                                                                |
| <a id="showusage"></a> `showUsage`                       | () => `Awaitable`\<`undefined` \| `string`\>        | Show the usage of the application. if `--help` option is specified, it will print the usage to the console.        |
| <a id="showvalidationerrors"></a> `showValidationErrors` | (`error`) => `Awaitable`\<`undefined` \| `string`\> | Show validation errors. This is called when argument validation fails.                                             |
| <a id="showversion"></a> `showVersion`                   | () => `string`                                      | Show the version of the application. if `--version` option is specified, it will print the version to the console. |
