# CommandContext

<div id="commandcontext" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Command context.</p>
<p>Command context is the context of the command execution.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export interface CommandContext&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L378-L476" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--members">
<h4>Members</h4>
<div class="ox-api-entry__member-group">
<h5>Properties</h5>
<table class="ox-api-entry__members-table">
<thead><tr><th>Name</th><th>Kind</th><th>Type</th><th>Description</th></tr></thead>
<tbody>
<tr id="property-name">
  <td><code>name</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">string | undefined</code></td>
  <td><div class="ox-api-entry__member-description">Command name, that is the command that is executed.<br>The command name is same <a href="/api-ox/default/interfaces/CommandEnvironment.md#property-name"><code>CommandEnvironment.name</code></a>.</div></td>
</tr>
<tr id="property-description">
  <td><code>description</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">string | undefined</code></td>
  <td><div class="ox-api-entry__member-description">Command description, that is the description of the command that is executed.<br>The command description is same <a href="/api-ox/default/interfaces/CommandEnvironment.md#property-description"><code>CommandEnvironment.description</code></a>.</div></td>
</tr>
<tr id="property-env">
  <td><code>env</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">Readonly&lt;CommandEnvironment&lt;G&gt;&gt;</code></td>
  <td><div class="ox-api-entry__member-description">Command environment, that is the environment of the command that is executed.<br>The command environment is same <a href="/api-ox/default/interfaces/CommandEnvironment.md"><code>CommandEnvironment</code></a>.</div></td>
</tr>
<tr id="property-args">
  <td><code>args</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">ExtractArgs&lt;G&gt;</code></td>
  <td><div class="ox-api-entry__member-description">Command arguments, that is the arguments of the command that is executed.<br>The command arguments is same <a href="/api-ox/plugin/interfaces/Command.md#property-args"><code>Command.args</code></a>.</div></td>
</tr>
<tr id="property-explicit">
  <td><code>explicit</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">ExtractArgExplicitlyProvided&lt;G&gt;</code></td>
  <td><div class="ox-api-entry__member-description">Whether arguments were explicitly provided by the user.<br><br>- <code>true</code>: The argument was explicitly provided via command line<br>- <code>false</code>: The argument was not explicitly provided. This means either:<br>  - The value comes from a default value defined in the argument schema<br>  - The value is <code>undefined</code> (no explicit input and no default value)</div></td>
</tr>
<tr id="property-values">
  <td><code>values</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">ArgValues&lt;ExtractArgs&lt;G&gt;&gt;</code></td>
  <td><div class="ox-api-entry__member-description">Command values, that is the values of the command that is executed.<br>Resolve values with <code>resolveArgs</code> from command arguments and <a href="/api-ox/plugin/interfaces/Command.md#property-args"><code>Command.args</code></a>.</div></td>
</tr>
<tr id="property-positionals">
  <td><code>positionals</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">string[]</code></td>
  <td><div class="ox-api-entry__member-description">Command positionals arguments, that is the positionals of the command that is executed.<br>Resolve positionals with <code>resolveArgs</code> from command arguments.</div></td>
</tr>
<tr id="property-rest">
  <td><code>rest</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">string[]</code></td>
  <td><div class="ox-api-entry__member-description">Command rest arguments, that is the remaining argument not resolved by the optional command option delimiter <code>--</code>.</div></td>
</tr>
<tr id="property-_">
  <td><code>_</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">string[]</code></td>
  <td><div class="ox-api-entry__member-description">Original command line arguments.<br>This argument is passed from <code>cli</code> function.</div></td>
</tr>
<tr id="property-tokens">
  <td><code>tokens</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">ArgToken[]</code></td>
  <td><div class="ox-api-entry__member-description">Argument tokens, that is parsed by <code>parseArgs</code> function.</div></td>
</tr>
<tr id="property-omitted">
  <td><code>omitted</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">boolean</code></td>
  <td><div class="ox-api-entry__member-description">Whether the currently executing command has been executed with the sub-command name omitted.</div></td>
</tr>
<tr id="property-callmode">
  <td><code>callMode</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">CommandCallMode</code></td>
  <td><div class="ox-api-entry__member-description">Command call mode.<br>The command call mode is <code>entry</code> when the command is executed as an entry command, and <code>subCommand</code> when the command is executed as a sub-command.</div></td>
</tr>
<tr id="property-commandpath">
  <td><code>commandPath</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">string[]</code></td>
  <td><div class="ox-api-entry__member-description">The path of nested sub-commands that were resolved to reach the current command.<br><br>For example, if the user runs <code>git remote add</code>, <code>commandPath</code> would be <code>[&#39;remote&#39;, &#39;add&#39;]</code>.<br>For the entry command, this is an empty array.</div></td>
</tr>
<tr id="property-tokebab">
  <td><code>toKebab</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">boolean</code></td>
  <td><div class="ox-api-entry__member-description">Whether to convert the camel-case style argument name to kebab-case.<br>This context value is set from <a href="/api-ox/plugin/interfaces/Command.md#property-tokebab"><code>Command.toKebab</code></a> option.</div></td>
</tr>
<tr id="property-log">
  <td><code>log</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">(message?: any) =&gt; void</code></td>
  <td><div class="ox-api-entry__member-description">Output a message.<br><br>If <a href="/api-ox/default/interfaces/CommandEnvironment.md#property-usagesilent"><code>CommandEnvironment.usageSilent</code></a> is true, the message is not output.</div><ul class="ox-api-entry__member-params"><li><code>message</code> an output message, see <code>console.log</code></li><li><code>optionalParams</code> an optional parameters, see <code>console.log</code></li></ul></td>
</tr>
<tr id="property-extensions">
  <td><code>extensions</code></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">unknown</code></td>
  <td><div class="ox-api-entry__member-description">Command context extensions.</div></td>
</tr>
<tr id="property-validationerror">
  <td><code>validationError</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">AggregateError</code></td>
  <td><div class="ox-api-entry__member-description">Validation error from argument parsing.<br>This will be set if argument validation fails during CLI execution.</div></td>
</tr>
</tbody>
</table>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A type extending <a href="/api-ox/plugin/interfaces/GunshiParams.md"><code>GunshiParams</code></a> to specify the shape of command context.</span></li></ul>
</div>
</div>
