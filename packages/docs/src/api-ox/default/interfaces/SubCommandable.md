# SubCommandable

<div id="subcommandable" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Sub-command entry type for use in subCommands.</p>
<p>This type uses a loose structural match to bypass TypeScript&#39;s contravariance issues with function parameters, allowing any Command or LazyCommand to be used as a sub-command.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export interface SubCommandable</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L656-L708" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--members">
<h4>Members</h4>
<div class="ox-api-entry__member-group">
<h5>Properties</h5>
<table class="ox-api-entry__members-table">
<thead><tr><th>Name</th><th>Kind</th><th>Type</th><th>Description</th></tr></thead>
<tbody>
<tr id="property-name">
  <td><code>name</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">string</code></td>
  <td><div class="ox-api-entry__member-description">see <a href="/api-ox/default/interfaces/Command.md#property-name">Command.name</a></div></td>
</tr>
<tr id="property-description">
  <td><code>description</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">string</code></td>
  <td><div class="ox-api-entry__member-description">see <a href="/api-ox/default/interfaces/Command.md#property-description">Command.description</a></div></td>
</tr>
<tr id="property-args">
  <td><code>args</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">Args | Record&lt;string, any&gt;</code></td>
  <td><div class="ox-api-entry__member-description">see <a href="/api-ox/default/interfaces/Command.md#property-args">Command.args</a></div></td>
</tr>
<tr id="property-examples">
  <td><code>examples</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">string | unknown</code></td>
  <td><div class="ox-api-entry__member-description">see <a href="/api-ox/default/interfaces/Command.md#property-examples">Command.examples</a></div></td>
</tr>
<tr id="property-run">
  <td><code>run</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">() =&gt; any</code></td>
  <td><div class="ox-api-entry__member-description">see <a href="/api-ox/default/interfaces/Command.md#property-run">Command.run</a></div></td>
</tr>
<tr id="property-tokebab">
  <td><code>toKebab</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">boolean</code></td>
  <td><div class="ox-api-entry__member-description">see <a href="/api-ox/default/interfaces/Command.md#property-tokebab">Command.toKebab</a></div></td>
</tr>
<tr id="property-internal">
  <td><code>internal</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">boolean</code></td>
  <td><div class="ox-api-entry__member-description">see <a href="/api-ox/default/interfaces/Command.md#property-internal">Command.internal</a></div></td>
</tr>
<tr id="property-entry">
  <td><code>entry</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">boolean</code></td>
  <td><div class="ox-api-entry__member-description">see <a href="/api-ox/default/interfaces/Command.md#property-entry">Command.entry</a></div></td>
</tr>
<tr id="property-rendering">
  <td><code>rendering</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">any</code></td>
  <td><div class="ox-api-entry__member-description">see <a href="/api-ox/default/interfaces/Command.md#property-rendering">Command.rendering</a></div></td>
</tr>
<tr id="property-commandname">
  <td><code>commandName</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">string</code></td>
  <td><div class="ox-api-entry__member-description">see LazyCommand.commandName</div></td>
</tr>
<tr id="property-subcommands">
  <td><code>subCommands</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">Record&lt;string, any&gt; | Map&lt;string, any&gt;</code></td>
  <td><div class="ox-api-entry__member-description">Nested sub-commands for this command.</div></td>
</tr>
</tbody>
</table>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@since</span><span class="ox-api-entry__tag-value">v0.27.1</span></li></ul>
</div>
</div>
