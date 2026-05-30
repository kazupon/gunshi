# Command

<div id="command" class="ox-api-entry ox-api-entry--page">
<div class="ox-api-entry__prose">
<p>Command interface.</p>
</div>
<div class="ox-api-entry__section ox-api-entry__section--signature">
<h4>Signature</h4>
<pre v-pre><code class="language-typescript">export interface Command&lt;G extends GunshiParamsConstraint = DefaultGunshiParams&gt;</code></pre>
</div>
<p class="ox-api-entry__source"><a class="ox-api-entry__source-link" href="https://github.com/kazupon/gunshi/blob/main/packages/gunshi/src/types.ts#L553-L613" target="_blank" rel="noopener noreferrer">View source<span class="ox-api-entry__source-icon" aria-hidden="true"></span></a></p>
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
  <td><div class="ox-api-entry__member-description">Command name.<br>It&#39;s used to find command line arguments to execute from sub commands, and it&#39;s recommended to specify.</div></td>
</tr>
<tr id="property-description">
  <td><code>description</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">string</code></td>
  <td><div class="ox-api-entry__member-description">Command description.<br>It&#39;s used to describe the command in usage and it&#39;s recommended to specify.</div></td>
</tr>
<tr id="property-args">
  <td><code>args</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">ExtractArgs&lt;G&gt;</code></td>
  <td><div class="ox-api-entry__member-description">Command arguments.<br>Each argument can include a description property to describe the argument in usage.</div></td>
</tr>
<tr id="property-examples">
  <td><code>examples</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">string | CommandExamplesFetcher&lt;G&gt;</code></td>
  <td><div class="ox-api-entry__member-description">Command examples.<br>examples of how to use the command.</div></td>
</tr>
<tr id="property-run">
  <td><code>run</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">CommandRunner&lt;G&gt;</code></td>
  <td><div class="ox-api-entry__member-description">Command runner. it&#39;s the command to be executed</div></td>
</tr>
<tr id="property-tokebab">
  <td><code>toKebab</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">boolean</code></td>
  <td><div class="ox-api-entry__member-description">Whether to convert the camel-case style argument name to kebab-case.<br>If you will set to <code>true</code>, All <a href="#property-args"><code>Command.args</code></a> names will be converted to kebab-case.</div></td>
</tr>
<tr id="property-internal">
  <td><code>internal</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">boolean</code></td>
  <td><div class="ox-api-entry__member-description">Whether this is an internal command.<br>Internal commands are not shown in help usage.</div></td>
</tr>
<tr id="property-entry">
  <td><code>entry</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">boolean</code></td>
  <td><div class="ox-api-entry__member-description">Whether this command is an entry command.</div></td>
</tr>
<tr id="property-rendering">
  <td><code>rendering</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">RenderingOptions&lt;G&gt;</code></td>
  <td><div class="ox-api-entry__member-description">Rendering control options</div></td>
</tr>
<tr id="property-subcommands">
  <td><code>subCommands</code><span class="ox-api-badge">optional</span></td>
  <td><span class="ox-api-entry__member-kind">property</span></td>
  <td><code class="ox-api-entry__member-type language-typescript">Record&lt;string, SubCommandable&gt; | Map&lt;string, SubCommandable&gt;</code></td>
  <td><div class="ox-api-entry__member-description">Nested sub-commands for this command.<br><br>Allows building command trees like <code>git remote add</code>.<br>Each key is the sub-command name, and the value is a command or lazy command.</div></td>
</tr>
</tbody>
</table>
</div>
</div>
<div class="ox-api-entry__section ox-api-entry__section--tags">
<h4>Tags</h4>
<ul class="ox-api-entry__tags"><li><span class="ox-api-entry__tag-name">@typeParam</span><span class="ox-api-entry__tag-value">G - The Gunshi parameters constraint</span></li></ul>
</div>
</div>
