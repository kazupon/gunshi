# CliOptions

<div id="clioptions" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>CLI options of <a href="/api-ox/default/functions/cli.md"><code>cli</code></a> function.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export interface CliOptions&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L269-L361" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
<div class="ox-api-entry__section ox-api-entry__section--members">
<h4>Members</h4>
<div class="ox-api-entry__member-group">
<h5>Properties</h5>
<table class="ox-api-entry__members-table">
<thead><tr><th>Name</th><th>Kind</th><th>Type</th><th>Description</th></tr></thead>
<tbody>
<tr id="property-cwd">
  <td><code>cwd</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">string</code></td>
  <td><div class="ox-api-entry__member-description">Current working directory.</div></td>
</tr>
<tr id="property-name">
  <td><code>name</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">string</code></td>
  <td><div class="ox-api-entry__member-description">Command program name.</div></td>
</tr>
<tr id="property-description">
  <td><code>description</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">string</code></td>
  <td><div class="ox-api-entry__member-description">Command program description.</div></td>
</tr>
<tr id="property-version">
  <td><code>version</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">string</code></td>
  <td><div class="ox-api-entry__member-description">Command program version.</div></td>
</tr>
<tr id="property-subcommands">
  <td><code>subCommands</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">Record&lt;string, SubCommandable&gt; | Map&lt;string, SubCommandable&gt;</code></td>
  <td><div class="ox-api-entry__member-description">Sub commands.</div></td>
</tr>
<tr id="property-leftmargin">
  <td><code>leftMargin</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">number</code></td>
  <td><div class="ox-api-entry__member-description">Left margin of the command output.</div></td>
</tr>
<tr id="property-middlemargin">
  <td><code>middleMargin</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">number</code></td>
  <td><div class="ox-api-entry__member-description">Middle margin of the command output.</div></td>
</tr>
<tr id="property-usageoptiontype">
  <td><code>usageOptionType</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">boolean</code></td>
  <td><div class="ox-api-entry__member-description">Whether to display the usage optional argument type.</div></td>
</tr>
<tr id="property-usageoptionvalue">
  <td><code>usageOptionValue</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">boolean</code></td>
  <td><div class="ox-api-entry__member-description">Whether to display the optional argument value.</div></td>
</tr>
<tr id="property-usagesilent">
  <td><code>usageSilent</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">boolean</code></td>
  <td><div class="ox-api-entry__member-description">Whether to display the command usage.</div></td>
</tr>
<tr id="property-renderusage">
  <td><code>renderUsage</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">unknown | null</code></td>
  <td><div class="ox-api-entry__member-description">Render function the command usage.</div></td>
</tr>
<tr id="property-renderheader">
  <td><code>renderHeader</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">unknown | null</code></td>
  <td><div class="ox-api-entry__member-description">Render function the header section in the command usage.</div></td>
</tr>
<tr id="property-rendervalidationerrors">
  <td><code>renderValidationErrors</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">unknown | null</code></td>
  <td><div class="ox-api-entry__member-description">Render function the validation errors.</div></td>
</tr>
<tr id="property-fallbacktoentry">
  <td><code>fallbackToEntry</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">boolean</code></td>
  <td><div class="ox-api-entry__member-description">Whether to fallback to entry command when the sub-command is not found.</div></td>
</tr>
<tr id="property-plugins">
  <td><code>plugins</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">Plugin[]</code></td>
  <td><div class="ox-api-entry__member-description">User plugins.</div></td>
</tr>
<tr id="property-onbeforecommand">
  <td><code>onBeforeCommand</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">(ctx: Readonly&lt;CommandContext&lt;G&gt;&gt;) =&gt; Awaitable&lt;void&gt;</code></td>
  <td><div class="ox-api-entry__member-description">Hook that runs before any command execution</div><ul class="ox-api-entry__member-params"><li><code>ctx</code> The command context</li></ul></td>
</tr>
<tr id="property-onaftercommand">
  <td><code>onAfterCommand</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">(ctx: Readonly&lt;CommandContext&lt;G&gt;&gt;, result: string | undefined) =&gt; Awaitable&lt;void&gt;</code></td>
  <td><div class="ox-api-entry__member-description">Hook that runs after successful command execution</div><ul class="ox-api-entry__member-params"><li><code>ctx</code> The command context</li><li><code>result</code> The command execution result</li></ul></td>
</tr>
<tr id="property-onerrorcommand">
  <td><code>onErrorCommand</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">(ctx: Readonly&lt;CommandContext&lt;G&gt;&gt;, error: Error) =&gt; Awaitable&lt;void&gt;</code></td>
  <td><div class="ox-api-entry__member-description">Hook that runs when a command throws an error</div><ul class="ox-api-entry__member-params"><li><code>ctx</code> The command context</li><li><code>error</code> The error thrown during execution</li></ul></td>
</tr>
</tbody>
</table>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - A type extending <a href="/api-ox/default/interfaces/GunshiParams.md"><code>GunshiParams</code></a> to specify the shape of cli options.</span></li></ul>
</div>
</div>
